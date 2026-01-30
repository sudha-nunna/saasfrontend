"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Upload, FilePlus2, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
// papaparse and xlsx will be loaded dynamically on the client to avoid server/bundler resolution issues

// ✅ Product Type Definition
interface Product {
  id: number | string
  name: string
  sku: string
  category: string
  price: number
  stock: number
  minStock?: number
}

export default function Products() {
  // Core states
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)

  // Upload related states
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadPreview, setUploadPreview] = useState<any[] | null>(null)
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; date: string; time: string; rows: any[] }[]
  >([])

  // Single product states
  const [showAddModal, setShowAddModal] = useState(false)
  const [addErrors, setAddErrors] = useState<string[]>([])
  const [isSavingSingle, setIsSavingSingle] = useState(false)
  const [singleProduct, setSingleProduct] = useState<{
    name: string;
    sku: string;
    category: string;
    price: number;
    stock: number;
  }>({
    name: "",
    sku: "",
    category: "",
    price: 0,
    stock: 0
  })

  // Local helper to read BASE
  function apiBase() {
    return (typeof window !== 'undefined' && (window as any).__API_BASE) ?? (process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5000')
  }

  // Load products from backend on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5000/api'
        // save base on component scope if needed by other helpers
        ;(window as any).__API_BASE = BASE
        const res = await fetch(`${BASE}/api/products`)
        if (!res.ok) {
          const text = await res.text().catch(() => '')
          throw new Error(`Failed to fetch products from server: ${res.status} ${res.statusText} ${text}`)
        }
        const data = await res.json()
        // If backend uses _id for Mongo documents, remap to id
        setProducts(data?.map((p: any, idx: number) => ({
          id: p._id || p.id || idx + 1,
          name: p.name,
          sku: p.sku,
          category: p.category,
          price: p.price,
          stock: p.stock,
          minStock: p.minStock
        })) || [])
        setLoading(false)
      } catch (err: any) {
        setError(err.message || "Unknown error")
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().startsWith(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Robust CSV parser using PapaParse loaded dynamically on the client
  async function parseCSVWithPapa(text: string) {
    // Try dynamic import of PapaParse; if it fails, fall back to a basic CSV parser
    try {
      const mod = await import("papaparse")
      const Papa = (mod as any).default ?? mod
      const result = Papa.parse(text, { header: true, skipEmptyLines: true })
      const errors: string[] = []
      if (result.errors && (result.errors as any[]).length > 0) {
        ;(result.errors as any[]).forEach((e) => errors.push(e && e.message ? String(e.message) : String(e)))
      }

      const rows: any[] = (result.data as any[]).map((obj: any, idx: number) => ({
        id: Date.now() + idx,
        name: obj.name || obj.product || "",
        sku: obj.sku || obj.code || "",
        category: obj.category || obj.cat || "Uncategorized",
        price: Number(obj.price || obj.cost || 0) || 0,
        stock: Number(obj.stock || obj.qty || obj.quantity || 0) || 0,
      }))

      const validRows = rows.filter((r, i) => {
        if (!r.name || !r.sku) {
          errors.push(`Row ${i + 1}: missing name or sku`)
          return false
        }
        return true
      })

      return { rows: validRows, errors }
    } catch (err) {
      // Fallback: simple CSV parser that handles quoted fields
      const parseLine = (line: string) => {
        const re = /(?:"([^"]*(?:""[^"]*)*)"|([^",]+)|)(?:,|$)/g
        const fields: string[] = []
        let match
        while ((match = re.exec(line)) !== null) {
          const val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2] ?? ""
          fields.push(val)
          // avoid infinite loops on empty matches
          if (match.index === re.lastIndex) re.lastIndex++
        }
        return fields
      }

      const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "")
      if (lines.length === 0) return { rows: [], errors: ["CSV is empty"] }

      const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase())
      const rows: any[] = []
      const errors: string[] = []

      for (let i = 1; i < lines.length; i++) {
        const cols = parseLine(lines[i])
        if (cols.length === 1 && cols[0] === "") continue // skip empty
        if (cols.length !== headers.length) {
          errors.push(`Row ${i + 1}: column count mismatch`)
          continue
        }
        const obj: any = {}
        for (let j = 0; j < headers.length; j++) obj[headers[j]] = cols[j]

        const product: any = {
          id: Date.now() + i,
          name: obj.name || obj.product || "",
          sku: obj.sku || obj.code || "",
          category: obj.category || obj.cat || "Uncategorized",
          price: Number(obj.price || obj.cost || 0) || 0,
          stock: Number(obj.stock || obj.qty || obj.quantity || 0) || 0,
        }

        if (!product.name || !product.sku) {
          errors.push(`Row ${i + 1}: missing name or sku`)
          continue
        }
        rows.push(product)
      }

      return { rows, errors }
    }
  }

  // XLSX parser using dynamic import of SheetJS
  async function parseXLSX(file: File) {
    const mod = await import("xlsx")
    const XLSX = (mod as any).default ?? mod
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: "array" })
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as any[]

    const rows = json.map((obj: any, idx: number) => ({
      id: Date.now() + idx,
      name: obj.name || obj.product || "",
      sku: obj.sku || obj.code || "",
      category: obj.category || obj.cat || "Uncategorized",
      price: Number(obj.price || obj.cost || 0) || 0,
      stock: Number(obj.stock || obj.qty || obj.quantity || 0) || 0,
    }))

    const errors: string[] = []
    const validRows = rows.filter((r, i) => {
      if (!r.name || !r.sku) {
        errors.push(`Row ${i + 1}: missing name or sku`)
        return false
      }
      return true
    })

    return { rows: validRows, errors }
  }

  function handleFileInput(file?: File) {
    setUploadErrors([])
    setUploadPreview(null)
    setSelectedFile(null)
    if (!file) return

    setSelectedFile(file)

    const name = file.name.toLowerCase()
    if (name.endsWith(".csv")) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = String(e.target?.result || "")
        try {
          const { rows, errors } = await parseCSVWithPapa(text)
          if (errors.length) setUploadErrors(errors)
          setUploadPreview(rows)
        } catch (err) {
          setUploadErrors([String(err)])
        }
      }
      reader.readAsText(file)
    } else if (name.endsWith(".xls") || name.endsWith(".xlsx")) {
      parseXLSX(file)
        .then(({ rows, errors }) => {
          if (errors.length) setUploadErrors(errors)
          setUploadPreview(rows)
        })
        .catch((err) => setUploadErrors([String(err)]))
    } else {
      setUploadErrors(["Only .csv, .xls, .xlsx files are supported. Please select a supported file type."])
    }
  }

  async function onUploadClick() {
    if (!selectedFile) {
      setUploadErrors(["No file selected to upload."])
      return
    }

    let rows = uploadPreview || null

    // If preview not yet available (parsing may be async), parse the selected file now
    if (!rows) {
      const name = selectedFile.name.toLowerCase()
      try {
        if (name.endsWith('.csv')) {
          const text = await selectedFile.text()
          const parsed = await parseCSVWithPapa(text)
          if (parsed.errors.length) setUploadErrors(parsed.errors)
          rows = parsed.rows
        } else if (name.endsWith('.xls') || name.endsWith('.xlsx')) {
          const parsed = await parseXLSX(selectedFile)
          if (parsed.errors.length) setUploadErrors(parsed.errors)
          rows = parsed.rows
        } else {
          setUploadErrors(["Unsupported file type"]) 
          return
        }
      } catch (err) {
        console.error('Error parsing file:', err)
        setUploadErrors([err instanceof Error ? err.message : String(err)])
        return
      }
    }

    if (!rows || rows.length === 0) {
      setUploadErrors((prev) => [...prev, 'No valid rows to upload'])
      return
    }

    const now = new Date()
    const date = now.toLocaleDateString()
    const time = now.toLocaleTimeString()

    // Persist immediately and only add to uploadedFiles on success
    const result = await applyUpload(rows)
    if (result && result.ok) {
      setUploadedFiles((prev) => [{ name: selectedFile.name, date, time, rows }, ...prev])
      setSelectedFile(null)
    } else {
      // keep preview and selectedFile so user can fix issues
      console.warn('Upload not applied:', result?.message)
    }
  }

  // Only persist uploaded file history to localStorage
  useEffect(() => {
    try {
      const storedUploaded = localStorage.getItem("app_uploaded_files")
      if (storedUploaded) {
        setUploadedFiles(JSON.parse(storedUploaded))
      }
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("app_uploaded_files", JSON.stringify(uploadedFiles))
    } catch (e) {
      // ignore quota errors
    }
  }, [uploadedFiles])

  function viewUploaded(index: number) {
    const file = uploadedFiles[index]
    if (file) {
      setUploadPreview(file.rows)
      // keep modal open
    }
  }

  function deleteUploaded(index: number) {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Apply upload rows to backend. Returns { ok: boolean, message?: string }
  async function applyUpload(rowsArg?: any[]) {
    const rows = rowsArg ?? uploadPreview
    if (!rows || rows.length === 0) return { ok: false, message: 'No rows to upload' }

    try {
      // Send to backend for persistence
      const response = await fetch(`${apiBase()}/api/products/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows })
      })

      let body: any = null
      try { body = await response.json() } catch (e) { /* ignore json parse errors */ }

      if (!response.ok) {
        const msg = body && body.error ? String(body.error) : `Server returned ${response.status}`
        setUploadErrors([msg])
        console.error('Bulk upload failed', msg, body)
        return { ok: false, message: msg }
      }

      // Optionally inspect result for write errors
      if (body && body.error) {
        setUploadErrors([String(body.error)])
        return { ok: false, message: String(body.error) }
      }

      // Refresh products list from server and normalize IDs
      const productsResponse = await fetch(`${apiBase()}/api/products`)
      if (!productsResponse.ok) throw new Error('Failed to fetch updated products')
      const updatedRaw = await productsResponse.json()
      const updatedProducts = (updatedRaw || []).map((p: any, i: number) => ({
        ...p,
        id: p._id ?? p.id ?? p.sku ?? `prod-${i}-${Date.now()}`,
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: p.price,
        stock: p.stock,
        minStock: p.minStock
      }))
      setProducts(updatedProducts)

      // Dispatch event to notify other components
      try {
        window.dispatchEvent(new Event('inventory-updated'))
      } catch {}

      // success
      setShowUploadModal(false)
      setUploadPreview(null)
      setUploadErrors([])
      return { ok: true }
    } catch (err) {
      console.error('Error saving products:', err)
      const msg = err instanceof Error ? err.message : String(err)
      setUploadErrors([msg])
      return { ok: false, message: msg }
    }
  }

  // Submit a single product
  async function submitSingleProduct() {
   setAddErrors([])
   if (!singleProduct.name || !singleProduct.sku) {
     setAddErrors(["Name and SKU are required"])
     return
   }

   setIsSavingSingle(true)
   try {
     const productData = {
       name: singleProduct.name,
       sku: singleProduct.sku,
       category: singleProduct.category,
       price: singleProduct.price,
       cost: singleProduct.price * 0.8, // Assuming 80% cost
       stock: singleProduct.stock,
       minStock: Math.max(1, Math.floor(singleProduct.stock * 0.1)), // 10% of stock as min
       status: 'active'
     }

     const response = await fetch(`${apiBase()}/api/products/bulk`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ rows: [productData] })
     })

     if (!response.ok) {
       const error = await response.json()
       throw new Error(error.message || 'Failed to save product')
     }

     // Refresh products list
     const res = await fetch(`${apiBase()}/api/products`)
     if (!res.ok) throw new Error("Failed to fetch updated products")

     const data = await res.json()
     setProducts(data?.map((p: any, idx: number) => ({
       id: p._id || p.id || idx + 1,
       name: p.name,
       sku: p.sku,
       category: p.category,
       price: p.price,
       stock: p.stock,
       minStock: p.minStock
     })) || [])

     // Dispatch event to notify other components
     try {
       window.dispatchEvent(new Event('inventory-updated'))
     } catch {}

     setShowAddModal(false)
     setSingleProduct({ name: "", sku: "", category: "", price: 0, stock: 0 })
   } catch (err) {
     setAddErrors([err instanceof Error ? err.message : String(err)])
   } finally {
     setIsSavingSingle(false)
   }
 }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">Products</h1>
        <p className="text-muted-foreground mt-1">Manage your product inventory</p>
      </motion.div>

      {/* Search + Add Button */}
      <div className="flex gap-4 flex-col sm:flex-row relative">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Add Product Button + Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={18} />
            Add Product
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-10"
              >
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    setShowUploadModal(true)
                  }}
                  className="flex items-center gap-2 w-full px-4 py-3 hover:bg-muted transition-colors"
                >
                  <Upload size={18} />
                  <span>Upload CSV (Multiple Products)</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false)
                    setShowAddModal(true)
                  }}
                  className="flex items-center gap-2 w-full px-4 py-3 hover:bg-muted transition-colors"
                >
                  <FilePlus2 size={18} />
                  <span>Add Single Product</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowUploadModal(false)} />
            <motion.div
              initial={{ y: 10, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 10, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="relative z-10 w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-auto max-h-[calc(100vh-4rem)]"
            >
              {/* Top header */}
              <div className="py-6 px-8 border-b">
                <h2 className="text-2xl font-bold text-foreground text-center">Upload a File Here</h2>
                <p className="text-sm text-muted-foreground text-center mt-2">Reads CSV file and displays its content in tabular form</p>
              </div>

              {/* Upload area */}
              <div className="p-6 sm:p-8">
                <div className="mx-auto max-w-3xl">
                  <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                    <div className="mb-4">
                      <input
                        type="file"
                        accept=".csv,.xls,.xlsx"
                        onChange={(e) => handleFileInput(e.target.files?.[0])}
                        className="hidden"
                        id="file-input"
                      />
                      <label htmlFor="file-input" className="inline-flex items-center gap-3 px-4 py-2 bg-gray-100 border rounded cursor-pointer">
                        <span className="text-sm">Choose File</span>
                        <span className="text-sm text-muted-foreground">{selectedFile ? selectedFile.name : "No file chosen"}</span>
                      </label>
                      <button
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:opacity-90"
                        onClick={onUploadClick}
                      >
                        Upload
                      </button>
                    </div>

                    <div className="text-sm text-muted-foreground">Or drag & drop CSV here (not implemented)</div>
                  </div>
                </div>
              </div>

              {/* Uploaded files table */}
              <div className="border-t p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4">Uploaded files</h3>

                {uploadedFiles.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No files uploaded yet.</div>
                ) : (
                  <div className="overflow-auto max-h-64 border rounded">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="text-left p-3">Name</th>
                          <th className="text-left p-3">Date</th>
                          <th className="text-left p-3">Time</th>
                          <th className="p-3">View</th>
                          <th className="p-3">Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadedFiles.map((f, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                            <td className="p-3">{f.name}</td>
                            <td className="p-3">{f.date}</td>
                            <td className="p-3">{f.time}</td>
                            <td className="p-3 text-center">
                              <button className="text-blue-600 underline" onClick={() => viewUploaded(i)}>View</button>
                            </td>
                            <td className="p-3 text-center">
                              <button className="text-red-600" onClick={() => deleteUploaded(i)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Preview area below */}
                <div className="mt-6">
                  {uploadErrors.length > 0 && (
                    <div className="mb-4 text-sm text-red-600">
                      {uploadErrors.map((err, i) => (
                        <div key={i}>{err}</div>
                      ))}
                    </div>
                  )}

                  {uploadPreview && uploadPreview.length > 0 ? (
                    <div>
                      <h4 className="font-medium mb-2">Preview ({uploadPreview.length} rows)</h4>
                      <div className="overflow-auto max-h-48 border border-border rounded mb-4">
                        <table className="w-full text-sm">
                          <thead className="bg-muted p-2">
                            <tr>
                              <th className="text-left p-2">Name</th>
                              <th className="text-left p-2">SKU</th>
                              <th className="text-left p-2">Category</th>
                              <th className="text-right p-2">Price</th>
                              <th className="text-right p-2">Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {uploadPreview.map((r, i) => (
                              <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-transparent"}>
                                <td className="p-2">{r.name}</td>
                                <td className="p-2">{r.sku}</td>
                                <td className="p-2">{r.category}</td>
                                <td className="p-2 text-right">₹{r.price}</td>
                                <td className="p-2 text-right">{r.stock}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button className="px-3 py-1 rounded border" onClick={() => { setUploadPreview(null); setUploadErrors([]) }}>
                          Clear
                        </button>
                        <button className="px-3 py-1 rounded bg-primary text-primary-foreground" onClick={() => applyUpload()}>
                          Add Products ({uploadPreview.length})
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No preview available yet. Select a CSV to preview rows.</div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Single Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowAddModal(false)} />
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden"
            >
              <div className="p-6 border-b bg-gray-50">
                <h2 className="text-2xl font-bold text-black">Add New Product</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                {addErrors.length > 0 && (
                  <div className="mb-4 p-4 bg-red-50 text-red-600 rounded">
                    {addErrors.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">Name</label>
                    <input
                      type="text"
                      value={singleProduct.name}
                      onChange={(e) => setSingleProduct({ ...singleProduct, name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded bg-white text-black focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="Product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">SKU</label>
                    <input
                      type="text"
                      value={singleProduct.sku}
                      onChange={(e) => setSingleProduct({ ...singleProduct, sku: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded bg-white text-black focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="Stock keeping unit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">Category</label>
                    <input
                      type="text"
                      value={singleProduct.category}
                      onChange={(e) => setSingleProduct({ ...singleProduct, category: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded bg-white text-black focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="Product category"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Price</label>
                      <input
                        type="number"
                        value={singleProduct.price}
                        onChange={(e) => setSingleProduct({
                          ...singleProduct,
                          price: Number(e.target.value)
                        })}
                        className="w-full p-2 border border-gray-300 rounded bg-white text-black focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Stock</label>
                      <input
                        type="number"
                        value={singleProduct.stock}
                        onChange={(e) => setSingleProduct({
                          ...singleProduct,
                          stock: Number(e.target.value)
                        })}
                        className="w-full p-2 border border-gray-300 rounded bg-white text-black focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitSingleProduct}
                  disabled={isSavingSingle}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50"
                >
                  {isSavingSingle ? "Saving..." : "Save Product"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-red-500 bg-red-50 p-4 rounded-lg">
            {error}
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="col-span-3 text-center p-8 text-muted-foreground">
          No products found. Add some products to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-foreground">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.sku}</p>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{product.category}</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-lg font-bold text-foreground">₹{product.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Stock</p>
                  <p className={`text-lg font-bold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                    {product.stock}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}





