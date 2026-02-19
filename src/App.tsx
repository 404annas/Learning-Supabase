import { useEffect, useState } from "react";
import "./App.css";
import { supabase } from "./supabase-client";

interface Task {
  id: number,
  title: string,
  description: string,
  created_at: string
}

function App() {

  const [newTask, setNewTask] = useState({
    title: "",
    description: ""
  })
  const [newDescription, setNewDescription] = useState("")
  const [tasks, setTasks] = useState<Task[]>([])

  const fetchTasks = async () => {
    const { error, data } = await supabase.from("tasks").select("*").order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching tasks:", error.message);
      alert("Error: " + error.message);
      return;
    }

    setTasks(data)
  }

  const deleteTask = async (id: number) => {

    const { error } = await supabase.from("tasks").delete().eq("id", id)

    if (error) {
      console.error("Error deleting task:", error.message);
      alert("Error: " + error.message);
      return;
    }
  }

  const updateTask = async (id: number) => {
    const { error } = await supabase.from("tasks").update({ description: newDescription }).eq("id", id)

    if (error) {
      console.error("Error updating task:", error.message);
      alert("Error: " + error.message);
      return;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submitting task:", newTask);

    const { error } = await supabase.from("tasks").insert(newTask).single();

    if (error) {
      console.error("Error adding task:", error.message);
      alert("Error: " + error.message);
    } else {
      console.log("Task added successfully:", newTask);
      alert("Task added successfully!");
      setNewTask({ title: "", description: "" });
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  console.log(tasks);

  return (
    // Main container jo page ko center mein rakhta hai
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
      <h2>Task Manager CRUD</h2>

      {/* Form to add a new task - Naya task add karne ka form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Task Title"
          onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <textarea
          placeholder="Task Description"
          onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Add Task
        </button>
      </form>

      {/* List of Tasks - Tasks ki list yahan show hogi */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task, idx) => (
          <li
            key={idx}
            style={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            <div>
              <h3>Title</h3>
              <p>{task.title}</p>
              <p>Description</p>
              <p>{task.description}</p>
              <div>
                <textarea placeholder="Updated Description..." onChange={(e) => setNewDescription(e.target.value)}></textarea>
                {/* Edit and Delete buttons */}
                <button onClick={() => updateTask(task.id)} style={{ padding: "0.5rem 1rem", marginRight: "0.5rem" }}>
                  Edit
                </button>
                <button onClick={() => deleteTask(task.id)} style={{ padding: "0.5rem 1rem" }}>
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;