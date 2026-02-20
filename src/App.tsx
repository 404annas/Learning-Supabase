import TaskManager from './components/TaskManager'
import "./App.css"
import { Auth } from './components/Auth'

const App = () => {
  return (
    <div>
      <TaskManager />
      <Auth />
    </div>
  )
}

export default App