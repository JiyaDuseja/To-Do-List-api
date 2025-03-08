const express= require("express");
const admin =require("firebase-admin");
const app=express();
const PORT=3000;
app.use(express.json());
const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_KEY, "base64").toString("utf-8"));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();


app.get("/", (req, res) => {
    res.send("I will take your To-Do List");
});
app.post("/tasks", async (req, res) => {
   
        const { task } = req.body; // Get the task from the request body

        if (!task) {
            return res.status(400).json({ error: "Task is required" });
        }

        // Add task to Firestore
        const newTask = await db.collection("tasks").add({
            task,
            completed: false, // Default to false
            createdAt: new Date(),
        });

        res.status(201).json({ id: newTask.id, task, completed: false });
    })
    app.get("/tasks", async (req, res) => {
        
            const tasksSnapshot = await db.collection("tasks").get();
            const tasks = [];
    
            tasksSnapshot.forEach((doc) => {
                tasks.push({ id: doc.id, ...doc.data() });
            });
    
            res.status(200).json(tasks);})

            // Update a task by ID
app.put("/tasks/:id", async (req, res) => {
    try {
        const { id } = req.params; // Get task ID from the URL
        const { task, completed } = req.body; // Get updated data from request body

        // Check if task exists in Firestore
        const taskRef = db.collection("tasks").doc(id);
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists) {
            return res.status(404).json({ error: "Task not found" });
        }

        // Update the task in Firestore
        await taskRef.update({
            task: task !== undefined ? task : taskDoc.data().task, // Update task if provided
            completed: completed !== undefined ? completed : taskDoc.data().completed // Update completed status if provided
        });

        res.status(200).json({ message: "Task updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});
// Delete a task by ID
app.delete("/tasks/:id", async (req, res) => {
    try {
        const { id } = req.params; // Get task ID from the URL

        // Check if the task exists in Firestore
        const taskRef = db.collection("tasks").doc(id);
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists) {
            return res.status(404).json({ error: "Task not found" });
        }

        // Delete the task from Firestore
        await taskRef.delete();

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});


// Start the server

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});