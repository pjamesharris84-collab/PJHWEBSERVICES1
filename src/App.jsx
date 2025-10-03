import { useEffect, useState } from "react"

export default function App() {
  const [apiMessage, setApiMessage] = useState("Loading...")

  useEffect(() => {
    fetch("/api/server")
      .then(res => res.json())
      .then(data => setApiMessage(data.message))
      .catch(() => setApiMessage("Error connecting to API"))
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-brand-slate text-white">
      <h1 className="text-4xl font-bold text-blue-accent">
        PJH Web Services 🚀
      </h1>
      <p className="mt-4 text-lg">Backend says: {apiMessage}</p>
    </div>
  )
}
