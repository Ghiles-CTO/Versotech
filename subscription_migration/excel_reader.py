"""Minimal XLSX reader tailored for the legacy subscription workbook.

The workbook uses fairly simple structures (shared strings + sheetData rows)
so we can avoid third-party dependencies like openpyxl/pandas and keep the ETL
script runnable in constrained environments.
"""

from __future__ import annotations

import re
import zipfile
from contextlib import contextmanager
from dataclasses import dataclass
from typing import Dict, Iterable, Iterator, List, Optional, Tuple
from xml.etree import ElementTree as ET

XL_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PACKAGE_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"


@dataclass(frozen=True)
class Cell:
    row_index: int
    column: str
    value: Optional[str]


class ExcelReader:
    """Lightweight reader that yields rows as {column_letter: value} dicts."""

    def __init__(self, path: str):
        self._zip = zipfile.ZipFile(path)
        self._shared_strings = self._load_shared_strings()
        self._sheet_targets = self._build_sheet_targets()

    def close(self) -> None:
        self._zip.close()

    @contextmanager
    def open(self) -> Iterator["ExcelReader"]:
        try:
            yield self
        finally:
            self.close()

    def sheet_names(self) -> List[str]:
        return list(self._sheet_targets.keys())

    def iter_rows(
        self, sheet_name: str, *, min_row: int = 1, max_rows: Optional[int] = None
    ) -> Iterator[Tuple[int, Dict[str, Optional[str]]]]:
        sheet_path = self._sheet_targets.get(sheet_name)
        if not sheet_path:
            raise KeyError(f"Sheet '{sheet_name}' not found in workbook")
        xml = self._zip.read(f"xl/{sheet_path}")
        root = ET.fromstring(xml)
        sheet_data = root.find(f"{{{XL_NS}}}sheetData")
        if sheet_data is None:
            return

        count = 0
        for row in sheet_data.findall(f"{{{XL_NS}}}row"):
            row_index = int(row.get("r"))
            if row_index < min_row:
                continue
            values: Dict[str, Optional[str]] = {}
            for cell in row.findall(f"{{{XL_NS}}}c"):
                ref = cell.get("r")
                if ref is None:
                    continue
                column = _column_from_reference(ref)
                value = self._extract_cell_value(cell)
                values[column] = value
            yield row_index, values
            count += 1
            if max_rows is not None and count >= max_rows:
                break

    # Internal helpers -----------------------------------------------------

    def _load_shared_strings(self) -> List[str]:
        try:
            xml = self._zip.read("xl/sharedStrings.xml")
        except KeyError:
            return []
        root = ET.fromstring(xml)
        strings: List[str] = []
        for si in root.findall(f"{{{XL_NS}}}si"):
            text = "".join(node.text or "" for node in si.findall(".//{%s}t" % XL_NS))
            strings.append(text)
        return strings

    def _build_sheet_targets(self) -> Dict[str, str]:
        workbook = ET.fromstring(self._zip.read("xl/workbook.xml"))
        rels = ET.fromstring(self._zip.read("xl/_rels/workbook.xml.rels"))
        rel_map = {}
        for rel in rels:
            rel_map[rel.get("Id")] = rel.get("Target")
        targets: Dict[str, str] = {}
        sheets_root = workbook.find(f"{{{XL_NS}}}sheets")
        if sheets_root is None:
            return targets
        for sheet in sheets_root.findall(f"{{{XL_NS}}}sheet"):
            name = sheet.get("name")
            r_id = sheet.get(f"{{{REL_NS}}}id") or sheet.get(f"{{{PACKAGE_REL_NS}}}id") or sheet.get("id")
            if name and r_id and r_id in rel_map:
                targets[name] = rel_map[r_id]
        return targets

    def _extract_cell_value(self, cell: ET.Element) -> Optional[str]:
        value_node = cell.find(f"{{{XL_NS}}}v")
        if value_node is None:
            inline = cell.find(f"{{{XL_NS}}}is")
            if inline is not None:
                text = "".join(node.text or "" for node in inline.findall(f".//{{{XL_NS}}}t"))
                return text or None
            return None
        raw = value_node.text
        if raw is None:
            return None
        if cell.get("t") == "s":
            try:
                return self._shared_strings[int(raw)]
            except (ValueError, IndexError):
                return raw
        return raw


_COL_REF_RE = re.compile(r"([A-Z]+)")


def _column_from_reference(cell_ref: str) -> str:
    match = _COL_REF_RE.match(cell_ref)
    if not match:
        raise ValueError(f"Invalid cell reference '{cell_ref}'")
    return match.group(1)


__all__ = ["ExcelReader", "Cell"]
