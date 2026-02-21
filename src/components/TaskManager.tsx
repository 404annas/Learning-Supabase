import { useEffect, useState, type ChangeEvent } from "react";
import { supabase } from "../supabase-client";

interface Task {
    id: number,
    title: string,
    description: string,
    created_at: string
    image_url?: string
}

function TaskManager() {

    const [newTask, setNewTask] = useState({
        title: "",
        description: ""
    })
    const [newDescription, setNewDescription] = useState("")
    const [tasks, setTasks] = useState<Task[]>([])
    const [taskImage, setTaskImage] = useState<File | null>(null)

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
        } else {
            console.log("Task deleted successfully!");
            alert("Task deleted successfully!");
            fetchTasks();
        }
    }

    const updateTask = async (id: number) => {
        if (!newDescription) {
            alert("Please enter a new description first!");
            return;
        }

        const { error } = await supabase.from("tasks").update({ description: newDescription }).eq("id", id)

        if (error) {
            console.error("Error updating task:", error.message);
            alert("Error: " + error.message);
            return;
        } else {
            console.log("Task updated successfully!");
            alert("Task updated successfully!");
            setNewDescription("");
            fetchTasks();
        }
    }

    const uploadImage = async (file: File): Promise<string | null> => {
        const filePath = `${file.name}-${Date.now()}`

        const { error } = await supabase.storage.from("tasks-images").upload(filePath, file)

        if (error) {
            console.log("Error occurred while uploading image", error.message);
            return null;
        } else {
            alert("Image uploaded successfully.")
        }

        const { data } = await supabase.storage.from("tasks-images").getPublicUrl(filePath)

        return data.publicUrl;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            console.error("Auth error:", authError);
            alert("You must be logged in to add a task!");
            return;
        }

        console.log("Current Logged In User ID:", user.id);

        let imageUrl: string | null = null;
        if (taskImage) {
            imageUrl = await uploadImage(taskImage)
        }

        const taskToInsert = {
            title: newTask.title,
            description: newTask.description,
            user_id: user.id,
            image_url: imageUrl
        }

        const { error } = await supabase.from("tasks").insert(taskToInsert).single();

        if (error) {
            console.error("Error adding task:", error.message);
            alert("Error: " + error.message);
        } else {
            console.log("Task added successfully!");
            alert("Task added successfully!");
            setNewTask({ title: "", description: "" });
            setTaskImage(null)
        }
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setTaskImage(e.target.files[0])
        }
    }

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        // 1. Create the channel
        const channel = supabase.channel("tasks-channel")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "tasks" }, (payload) => {
                console.log("Realtime Payload received!", payload);
                const newTask = payload.new as Task;
                setTasks((prev) => [...prev, newTask]); // Add the new task to the UI
            })
            .subscribe((status) => {
                console.log("Subscription status:", status);
            });

        // 2. CLEANUP FUNCTION (Very Important!)
        // This stops the CHANNEL_ERROR by closing the old connection before making a new one
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

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
                <input type="file" accept="image/*" onChange={handleFileChange} />
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
                            {task.image_url && (
                                <img
                                    src={task.image_url}
                                    alt="Task attachment"
                                    style={{ maxWidth: "100%", height: "auto", marginTop: "10px", borderRadius: "8px" }}
                                />
                            )}
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

export default TaskManager;