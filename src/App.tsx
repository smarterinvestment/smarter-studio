import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import Editor from "./pages/Editor"
import Chat from "./pages/Chat"
import Library from "./pages/Library"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/library" element={<Library />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
