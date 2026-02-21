import TaskManager from './components/TaskManager'
import "./App.css"
import { Auth } from './components/Auth'
import { useEffect, useState } from 'react'
import { supabase } from './supabase-client'

const App = () => {
  const [session, setSession] = useState<any>(null);

  const fetchUserSession = async () => {
    const currentSession = await supabase.auth.getSession()
    console.log(currentSession)
    setSession(currentSession.data.session)
  }

  useEffect(() => {
    fetchUserSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      authListener.subscription.unsubscribe();
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div>
      {session ? (
        <>
          <button onClick={handleLogout}>Log Out</button>

          <TaskManager />
        </>
      ) :
        <Auth />
      }
    </div>
  )
}

export default App