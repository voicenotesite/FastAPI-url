import { useState, useEffect } from 'react'
import { api } from './api'
import Login from './Login'
import Dashboard from './Dashboard'

function EcoBar() {
  return (
    <div style={{
      background:'#1a1a2e', borderBottom:'1px solid #262640',
      padding:'4px 12px', display:'flex', gap:'6px',
      justifyContent:'center', flexWrap:'wrap', fontSize:'.65rem',
      color:'#8888b0', fontFamily:'Inter,sans-serif'
    }}>
      <a href="https://voicenotesite.github.io/WebBartosz/" target="_blank" style={{color:'#8888b0',textDecoration:'none',padding:'2px 8px',borderRadius:'4px'}}>🏠 Portfolio</a>
      <a href="https://graphql-blog-lxjy.onrender.com/graphql" target="_blank" style={{color:'#8888b0',textDecoration:'none',padding:'2px 8px',borderRadius:'4px'}}>GraphQL Blog</a>
      <a href="https://ai-chat-proxy-twj4.onrender.com" target="_blank" style={{color:'#8888b0',textDecoration:'none',padding:'2px 8px',borderRadius:'4px'}}>AI Chat</a>
      <a href="https://python-portfolio-y0z8.onrender.com" target="_blank" style={{color:'#8888b0',textDecoration:'none',padding:'2px 8px',borderRadius:'4px'}}>Unified API</a>
      <a href="https://voicenotesite.github.io/reports/" target="_blank" style={{color:'#8888b0',textDecoration:'none',padding:'2px 8px',borderRadius:'4px'}}>Reports</a>
      <a href="https://github.com/voicenotesite" target="_blank" style={{color:'#8888b0',textDecoration:'none',padding:'2px 8px',borderRadius:'4px'}}>GitHub</a>
    </div>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = api.getToken()
    setAuthed(!!token)
    setLoading(false)
  }, [])

  if (loading) return null

  return (
    <>
      <EcoBar />
      {authed ? (
        <Dashboard onLogout={() => { api.clearToken(); setAuthed(false) }} />
      ) : (
        <Login onAuth={() => setAuthed(true)} />
      )}
    </>
  )
}
