"use client"

import { useState, useEffect } from "react"
import { Calculator, Trash2, Save, RefreshCw, Upload, FileText, X } from "lucide-react"
import { motion } from "framer-motion"

// Resolve API base consistently
const API = (process.env.NEXT_PUBLIC_API_URL || "https://saas-backend-1-p5kr.onrender.com/api").replace(/\/$/, "");

interface BillingItem {
  productName: string
  quantity: number
  price: number
  total: number
  isUploaded: boolean
}

interface UploadedFile {
  filename: string
  originalname: string
  mimetype: string
  size: number
  path: string
}

export default function Billing() {
  const [billingItems, setBillingItems] = useState<BillingItem[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [notes, setNotes] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)
  const [productName, setProductName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [uploadedFileTotal, setUploadedFileTotal] = useState(0)

  // Load billing data from localStorage on component mount
  useEffect(() => {
    try {
      const savedBillingData = localStorage.getItem('billingData')
      if (savedBillingData) {
        const data = JSON.parse(savedBillingData)
        setBillingItems(data.billingItems || [])
        setCustomerName(data.customerName || "")
        setCustomerEmail(data.customerEmail || "")
        setNotes(data.notes || "")
        setUploadedFiles(data.uploadedFiles || [])
        setUploadedFileTotal(data.uploadedFileTotal || 0)
      }
    } catch (error) {
      console.error('Error loading billing data from localStorage:', error)
    }
  }, [])

  // Save billing data to localStorage whenever it changes
  useEffect(() => {
    try {
      const billingData = {
        billingItems,
        customerName,
        customerEmail,
        notes,
        uploadedFiles,
        uploadedFileTotal
      }
      localStorage.setItem('billingData', JSON.stringify(billingData))
    } catch (error) {
      console.error('Error saving billing data to localStorage:', error)
    }
  }, [billingItems, customerName, customerEmail, notes, uploadedFiles, uploadedFileTotal])

  // Calculate uploaded total whenever billing items change
  useEffect(() => {
    const uploadedTotal = billingItems
      .filter(item => item.isUploaded)
      .reduce((sum, item) => sum + item.total, 0)
    setUploadedFileTotal(uploadedTotal)
  }, [billingItems])

  // Calculate total whenever billing items change
  useEffect(() => {
    const total = billingItems.reduce((sum, item) => sum + item.total, 0)
    setTotalAmount(total)
  }, [billingItems])


  const removeItem = (index: number) => {
    setBillingItems(billingItems.filter((_, i) => i !== index))
  }


  const clearAll = () => {
    setBillingItems([])
    setCustomerName("")
    setCustomerEmail("")
    setNotes("")
    setUploadedFiles([])
    setProductName("")
    setQuantity("")
    setPrice("")
  }

  const addProduct = () => {
    if (!productName.trim() || !quantity || !price) {
      alert('Please fill in all product fields')
      return
    }

    const qty = parseInt(quantity)
    const prc = parseFloat(price)

    if (qty < 1 || prc < 0) {
      alert('Invalid quantity or price values')
      return
    }

    const total = qty * prc
    const newItem: BillingItem = {
      productName: productName.trim(),
      quantity: qty,
      price: prc,
      total,
      isUploaded: false
    }

    setBillingItems(prev => [...prev, newItem])
    setProductName("")
    setQuantity("")
    setPrice("")
    setUploadedFileTotal(0)
  }



  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingFiles(true)

    try {
      // Handle CSV files for billing calculation
      if (file.name.endsWith('.csv')) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${API}/billing/bulk-csv`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to upload CSV' }))
          throw new Error(errorData.error || 'Failed to upload CSV')
        }

        const result = await response.json()
        const itemsWithFlag = result.items.map((item: any) => ({ ...item, isUploaded: true }))
        setBillingItems(itemsWithFlag)
        setUploadedFileTotal(result.totalAmount)
        setUploadedFiles(prev => [...prev, {
          filename: `csv-${Date.now()}.csv`,
          originalname: file.name,
          mimetype: file.type || 'text/csv',
          size: file.size,
          path: `uploads/csv-${Date.now()}.csv`
        }])
        alert(result.message)
      }
      // Handle JSON files for billing calculation
      else if (file.name.endsWith('.json')) {
        const fileContent = await file.text()
        const productData = JSON.parse(fileContent)

        // Validate the JSON structure
        if (!productData.productName || !productData.quantity || productData.price === undefined) {
          throw new Error('Invalid JSON format. Required fields: productName, quantity, price')
        }

        const qty = parseInt(productData.quantity)
        const prc = parseFloat(productData.price)

        if (qty < 1 || prc < 0) {
          throw new Error('Invalid quantity or price values in JSON')
        }

        const total = qty * prc
        const newItem: BillingItem = {
          productName: productData.productName.trim(),
          quantity: qty,
          price: prc,
          total,
          isUploaded: true
        }

        setBillingItems(prev => [...prev, newItem])
        setUploadedFileTotal(total)
        setUploadedFiles(prev => [...prev, {
          filename: `json-${Date.now()}.json`,
          originalname: file.name,
          mimetype: file.type || 'application/json',
          size: file.size,
          path: `uploads/json-${Date.now()}.json`
        }])
        alert('Product data loaded and added to billing!')
      }
      // Handle other files - not supported yet
      else {
        throw new Error('Only CSV and JSON files are supported for billing calculations')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploadingFiles(false)
      event.target.value = '' // Reset file input
    }
  }

  const removeFile = (filename: string) => {
    setUploadedFiles(uploadedFiles.filter(file => file.filename !== filename))
  }

  const saveBilling = async () => {
    if (billingItems.length === 0) {
      alert('Please add at least one item before saving.')
      return
    }

    if (!customerName.trim()) {
      alert('Please enter customer name.')
      return
    }

    setIsLoading(true)
    try {
      // For now, we'll use product names since we don't have a product lookup system
      // In a real app, you'd look up products by name to get their IDs
      const billingData = {
        customer: {
          name: customerName.trim(),
          email: customerEmail.trim()
        },
        items: billingItems.map(item => ({
          product: item.productName, // Using name for now - should be product ID
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        subtotal: totalAmount,
        discount: 0,
        tax: 0,
        totalAmount: totalAmount,
        notes: notes.trim(),
        paymentMethod: 'cash',
        status: 'draft'
      }

      const response = await fetch(`${API}/billing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billingData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to save billing')
      }

      const savedBilling = await response.json()
      alert(`Billing saved successfully! Bill Number: ${savedBilling.billNumber}`)
      // Clear localStorage after successful save
      localStorage.removeItem('billingData')
      clearAll()
    } catch (error) {
      console.error('Error saving billing:', error)
      alert(`Failed to save billing: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Billing</h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {isUploadingFiles ? <RefreshCw size={16} className="animate-spin" /> : <FileText size={16} />}
              Upload File
              <input
                type="file"
                accept=".csv,.json,.txt"
                onChange={handleFileUpload}
                disabled={isUploadingFiles}
                className="hidden"
              />
            </label>
            <button
              onClick={saveBilling}
              disabled={billingItems.length === 0 || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              Save Billing
            </button>
          </div>
        </div>
      </div>

      {/* Total Amount Display */}
      {billingItems.length > 0 && (
        <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-primary">Total Amount</h3>
              <p className="text-sm text-muted-foreground">
                Total products: {billingItems.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">${totalAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Billing Items Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-lg border overflow-hidden"
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calculator size={20} />
              Billing Items ({billingItems.length})
            </h2>
            <div className="flex items-center gap-4">
              {/* Add Product Inputs */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Product Name"
                  className="px-3 py-2 border border-input rounded-lg bg-background text-sm"
                />
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Qty"
                  min="1"
                  className="w-20 px-3 py-2 border border-input rounded-lg bg-background text-sm"
                />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Price"
                  step="0.01"
                  min="0"
                  className="w-24 px-3 py-2 border border-input rounded-lg bg-background text-sm"
                />
                <button
                  onClick={addProduct}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  Add
                </button>
              </div>
              {billingItems.length > 0 && (
                <button
                  onClick={clearAll}
                  disabled={isLoading}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>


        {billingItems.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Calculator size={48} className="mx-auto mb-4 opacity-50" />
            <p>No billing items yet. Upload a CSV or JSON file to get started.</p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {billingItems.map((item, index) => (
                    <tr key={index} className="hover:bg-muted/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {item.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        ${item.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => removeItem(index)}
                          className="text-destructive hover:text-destructive/80 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* File-based Calculation Summary */}
            {uploadedFileTotal > 0 && (
              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-primary">Uploaded Products Total</h4>
                    <p className="text-sm text-muted-foreground">
                      Total uploaded products: {billingItems.filter(item => item.isUploaded).length} | Total amount: ${uploadedFileTotal.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">${uploadedFileTotal.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">From uploaded files</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Customer Information Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-lg border p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Customer Email</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Enter customer email"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes..."
            rows={3}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background resize-none"
          />
        </div>
      </motion.div>

      {/* Uploaded Files Section */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-lg border p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Upload size={20} />
            Uploaded Files ({uploadedFiles.length})
          </h2>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div key={file.filename} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-muted-foreground" />
                  <div>
                    <div className="font-medium">{file.originalname}</div>
                    <div className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB • {file.mimetype}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.filename)}
                  className="text-destructive hover:text-destructive/80 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
