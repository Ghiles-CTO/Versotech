/**
 * Debug script to test authentication behavior
 * Run this in browser console to see auth state
 */

console.log('🔍 VERSO Auth Debug Tool')

// Check localStorage
console.log('\n📦 LocalStorage Auth Keys:')
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('sb-')) {
    console.log(`- ${key}: ${localStorage.getItem(key) ? '✅ Present' : '❌ Empty'}`)
  }
})

// Check sessionStorage
console.log('\n📂 SessionStorage Keys:')
Object.keys(sessionStorage).forEach(key => {
  if (key.includes('verso') || key.includes('supabase') || key.includes('sb-')) {
    console.log(`- ${key}: ${sessionStorage.getItem(key) ? '✅ Present' : '❌ Empty'}`)
  }
})

// Check session marker
const sessionMarker = sessionStorage.getItem('verso-session-id')
console.log(`\n🎯 Session Marker: ${sessionMarker ? '✅ Present' : '❌ Missing'}`)

// Test function to clear all auth
window.clearAllAuth = () => {
  console.log('🧹 Clearing all auth data...')

  // Clear localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('sb-')) {
      localStorage.removeItem(key)
      console.log(`Removed: ${key}`)
    }
  })

  // Clear sessionStorage
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('verso') || key.includes('supabase') || key.includes('sb-')) {
      sessionStorage.removeItem(key)
      console.log(`Removed: ${key}`)
    }
  })

  console.log('✅ All auth data cleared! Refresh the page.')
}

console.log('\n💡 Available commands:')
console.log('- clearAllAuth() - Force clear all authentication data')

console.log('\n' + '='.repeat(50))