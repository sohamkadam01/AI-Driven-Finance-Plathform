// src/components/Dashboard/ReceiptUploadModal.jsx

import React, { useState, useRef } from 'react';
import { 
  X, Upload, FileText, Loader2, CheckCircle, AlertCircle, Brain,
  CloudUpload, Image, File, Trash2, ArrowRight, CreditCard, 
  Calendar, Building2, Receipt, Sparkles, Shield, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import uploadReceiptImg from '../../assets/upload_receipt.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const RECEIPT_LOG_PREFIX = '[Receipt OCR]';

const ReceiptUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [budgetWarning, setBudgetWarning] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState('upload'); // upload, processing, budget_warning, result
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Reset state when modal closes
  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setBudgetWarning(null);
    setDocumentId(null);
    setError('');
    setStep('upload');
    setUploading(false);
    setProcessing(false);
    setDragActive(false);
    if (onSuccess) onSuccess();
    onClose();
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.info(`${RECEIPT_LOG_PREFIX} File selected`, {
      name: file.name,
      type: file.type,
      sizeBytes: file.size,
      sizeMB: (file.size / (1024 * 1024)).toFixed(2),
    });

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      console.warn(`${RECEIPT_LOG_PREFIX} File rejected: invalid type`, {
        name: file.name,
        type: file.type,
      });
      setError('Please select a valid image (JPEG, PNG) or PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.warn(`${RECEIPT_LOG_PREFIX} File rejected: too large`, {
        name: file.name,
        sizeBytes: file.size,
        maxBytes: 5 * 1024 * 1024,
      });
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const calculateFileHash = async (file) => {
    console.info(`${RECEIPT_LOG_PREFIX} Calculating file hash`, { filename: file.name });
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hash = Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
    console.info(`${RECEIPT_LOG_PREFIX} File hash ready`, { filename: file.name, fileHash: hash });
    return hash;
  };

  const applyReceiptResponse = (responseData) => {
    const data = responseData.data || {};

    console.info(`${RECEIPT_LOG_PREFIX} Java receipt response received`, {
      success: responseData.success,
      message: responseData.message,
      status: data.status,
      documentId: data.documentId,
      transactionsCreated: data.transactionsCreated,
    });

    if (data.status === 'BUDGET_WARNING') {
      console.warn(`${RECEIPT_LOG_PREFIX} Budget warning`, data);
      setDocumentId(data.documentId);
      setBudgetWarning({
        totalAmount: data.extractedAmount,
        vendorName: data.vendorName,
        categoryName: data.budgetImpact?.categoryName || data.receiptType,
        budgetImpact: data.budgetImpact
      });
      setStep('budget_warning');
      return;
    }

    if (data.status === 'DUPLICATE') {
      console.warn(`${RECEIPT_LOG_PREFIX} Duplicate receipt detected`, data);
      setError(responseData.message || 'This receipt was already logged. Duplicate detected.');
      setStep('upload');
      return;
    }

    if (responseData.success) {
      console.info(`${RECEIPT_LOG_PREFIX} Receipt processed successfully`, data);
      setResult({
        vendorName: data.vendorName,
        extractedAmount: data.extractedAmount,
        transactionDate: data.transactionDate,
        receiptType: data.receiptType,
        transactionsCreated: data.transactionsCreated || 1
      });
      setStep('result');
      if (onSuccess) onSuccess(data);
      return;
    }

    console.error(`${RECEIPT_LOG_PREFIX} Java receipt processing failed`, responseData);
    throw new Error(responseData.message || 'Failed to save receipt');
  };

  // Handle process document with budget override
  const handleProcessDocument = async (docId, overrideBudget = false) => {
    setProcessing(true);
    
    try {
      const token = localStorage.getItem('token');
      console.info(`${RECEIPT_LOG_PREFIX} Processing saved receipt`, {
        documentId: docId,
        overrideBudget,
        endpoint: `${API_BASE_URL}/receipts/process/${docId}`,
        hasToken: Boolean(token),
      });
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const response = await axios.post(`${API_BASE_URL}/receipts/process/${docId}`,
        null,
        {
          params: { force: overrideBudget },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.info(`${RECEIPT_LOG_PREFIX} Saved receipt process response`, response.data);
      applyReceiptResponse(response.data);
    } catch (err) {
      console.error(`${RECEIPT_LOG_PREFIX} Saved receipt processing error`, {
        message: err.message,
        status: err.response?.status,
        response: err.response?.data,
        error: err,
      });
      setError(err.response?.data?.message || err.message || 'Failed to process document');
      setStep('upload');
    } finally {
      setProcessing(false);
    }
  };

  // Handle file upload and OCR
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setProcessing(true);
    setError('');
    setStep('processing');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      console.groupCollapsed(`${RECEIPT_LOG_PREFIX} Receipt upload flow started`);
      console.info(`${RECEIPT_LOG_PREFIX} API gateway base URL`, API_BASE_URL);
      console.info(`${RECEIPT_LOG_PREFIX} Selected receipt`, {
        name: selectedFile.name,
        type: selectedFile.type,
        sizeBytes: selectedFile.size,
        hasToken: Boolean(token),
      });
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const uploadUrl = `${API_BASE_URL}/ocr/extract`;
      console.info(`${RECEIPT_LOG_PREFIX} Sending image directly to Python OCR through Nginx`, {
        method: 'POST',
        endpoint: uploadUrl,
      });

      const ocrResponse = await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      console.info(`${RECEIPT_LOG_PREFIX} Python OCR response`, {
        status: ocrResponse.status,
        success: ocrResponse.data?.success,
        requestId: ocrResponse.data?.request_id,
        filename: ocrResponse.data?.filename,
        textLength: ocrResponse.data?.text_length,
        wordCount: ocrResponse.data?.word_count,
        confidence: ocrResponse.data?.confidence,
        engineUsed: ocrResponse.data?.engine_used,
        cached: ocrResponse.data?.cached,
        aiSuccess: ocrResponse.data?.ai_analysis?.success,
        raw: ocrResponse.data,
      });

      if (!ocrResponse.data.success) {
        throw new Error(ocrResponse.data.error || 'OCR extraction failed');
      }

      console.info(`${RECEIPT_LOG_PREFIX} Preparing OCR JSON for Java save endpoint`);
      const receiptPayload = {
        ...ocrResponse.data,
        filename: selectedFile.name,
        file_hash: await calculateFileHash(selectedFile)
      };

      console.info(`${RECEIPT_LOG_PREFIX} Sending extracted OCR JSON to Java`, {
        method: 'POST',
        endpoint: `${API_BASE_URL}/receipts/save-extracted`,
        filename: receiptPayload.filename,
        fileHash: receiptPayload.file_hash,
        textLength: receiptPayload.text_length,
      });

      const saveResponse = await axios.post(`${API_BASE_URL}/receipts/save-extracted`, receiptPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.info(`${RECEIPT_LOG_PREFIX} Java save/process response`, {
        status: saveResponse.status,
        raw: saveResponse.data,
      });
      applyReceiptResponse(saveResponse.data);
    } catch (err) {
      console.error(`${RECEIPT_LOG_PREFIX} Receipt upload flow error`, {
        message: err.message,
        status: err.response?.status,
        response: err.response?.data,
        error: err,
      });
      setError(err.response?.data?.message || err.message || 'Failed to process receipt');
      setStep('upload');
    } finally {
      console.info(`${RECEIPT_LOG_PREFIX} Receipt upload flow finished`);
      console.groupEnd();
      setUploading(false);
      setProcessing(false);
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const event = { target: { files: [file] } };
      handleFileSelect(event);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatBudgetMonth = (impactData) => {
    if (impactData?.budgetMonthLabel) return impactData.budgetMonthLabel;
    if (!impactData?.budgetMonth) return 'Receipt month';

    return new Date(impactData.budgetMonth).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getBudgetDetails = () => {
    const impact = budgetWarning?.budgetImpact;
    if (!impact?.hasBudget) return [];

    const details = [
      ['Budget Type', impact.budgetType || 'Monthly category budget'],
      ['Budget Month', formatBudgetMonth(impact)],
      ['Category', impact.categoryName || budgetWarning.categoryName || 'Receipt category'],
      ['Budget Limit', formatCurrency(impact.budgetLimit || 0)],
      ['Spent Before', formatCurrency(impact.spentBefore || 0)],
      ['After Receipt', formatCurrency(impact.totalAfter || 0)]
    ];

    if (impact.isOverBudget) {
      details.push(['Over By', formatCurrency(impact.overBy || 0)]);
    } else {
      details.push(['Remaining After', formatCurrency(impact.remainingAfter || 0)]);
    }

    return details;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header - Google Material Design style */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Receipt size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Upload Receipt</h2>
              <p className="text-sm text-gray-500">AI-powered receipt scanning</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Upload Step */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Drag and drop area - Google Photos style */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 rounded-2xl transition-all duration-200 cursor-pointer ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 scale-[0.99]'
                    : selectedFile 
                      ? 'border-green-300 bg-green-50/30' 
                      : 'border-dashed border-gray-300 hover:border-blue-400 bg-gray-50/50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {!selectedFile ? (
                  <div className="py-16 px-8 text-center">
                    <div className={`relative inline-flex p-4 rounded-full mb-4 transition-all duration-200 ${
                      dragActive ? 'bg-blue-100 scale-110' : 'bg-gray-100'
                    }`}>
                      <img src={uploadReceiptImg} alt="" className="w-16 h-16 object-contain" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <CloudUpload size={14} className={dragActive ? 'text-blue-600' : 'text-gray-400'} />
                      </div>
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {dragActive ? 'Drop your receipt here' : 'Drag & drop your receipt'}
                    </p>
                    <p className="text-sm text-gray-400 mb-4">or click to browse</p>
                    <div className="flex justify-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Image size={12} /> JPG, PNG</span>
                      <span className="flex items-center gap-1"><File size={12} /> PDF</span>
                      <span className="flex items-center gap-1"><Upload size={12} /> Max 5MB</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {preview ? (
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img 
                            src={preview} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText size={32} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {(selectedFile.size / 1024).toFixed(0)} KB
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                              setPreview(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="text-sm text-gray-600 hover:text-gray-700 font-medium flex items-center gap-1"
                          >
                            <Upload size={14} /> Change
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Features Section - Google style */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={18} className="text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">AI-Powered Features</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle size={14} className="text-green-600" />
                    <span>Auto-extract amount</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle size={14} className="text-green-600" />
                    <span>Vendor recognition</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle size={14} className="text-green-600" />
                    <span>Smart categorization</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle size={14} className="text-green-600" />
                    <span>Duplicate detection</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 rounded-2xl flex items-start gap-3 border border-red-100">
                  <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Upload Failed</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Upload & Process
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Processing Step - Google style */}
          {step === 'processing' && (
            <div className="text-center py-16">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <Loader2 size={48} className="animate-spin text-blue-600" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles size={16} className="text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI is analyzing your receipt</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Extracting text and creating transaction... This may take a few seconds. 
                <strong> You can safely close this window; the process will continue in the background.</strong>
              </p>
              <div className="mt-8 flex flex-col items-center gap-4">
                <div className="flex justify-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                
                <button
                  onClick={handleClose}
                  className="mt-4 px-6 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Run in Background
                </button>
              </div>
            </div>
          )}

          {/* Budget Warning Screen - Google Material style */}
          {step === 'budget_warning' && budgetWarning && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl p-6 text-center border border-rose-100">
                <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <AlertCircle size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-rose-900 mb-2">Budget Alert!</h3>
                <p className="text-gray-600 mb-4">
                  Logging this <strong className="text-rose-600">₹{budgetWarning.totalAmount}</strong> transaction at 
                  {' '}<strong className="text-rose-600">{budgetWarning.vendorName}</strong> will exceed your monthly budget.
                </p>
                
                {getBudgetDetails().length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-6 text-left">
                    {getBudgetDetails().map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-white/80 border border-rose-100 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
                        <p className="mt-0.5 text-sm font-bold text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-6 text-left border border-rose-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Shield size={18} className="text-amber-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">AI Guardian Insight</p>
                      <p className="text-sm text-gray-700 mt-1">This spending is flagged as high risk. Consider if this purchase is necessary to stay on track with your savings goals.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel Transaction
                  </button>
                  <button
                    onClick={() => handleProcessDocument(documentId, true)}
                    disabled={processing}
                    className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 flex justify-center items-center gap-2"
                  >
                    {processing ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <ArrowRight size={18} />
                        Continue Anyway
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Result Step - Google Material style */}
          {step === 'result' && result && (
            <div className="space-y-6">
              {/* Success Banner */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 flex items-start gap-4 border border-green-100">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800 text-lg">Receipt processed successfully!</h3>
                  <p className="text-sm text-green-600 mt-1">
                    {result.transactionsCreated || 1} transaction(s) created
                  </p>
                </div>
              </div>

              {/* Extracted Information Card */}
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Sparkles size={16} className="text-blue-600" />
                    AI-Extracted Information
                  </h4>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1">
                        <Building2 size={12} /> Vendor
                      </p>
                      <p className="font-medium text-gray-900">{result.vendorName || 'Unknown'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1">
                        <CreditCard size={12} /> Amount
                      </p>
                      <p className="font-bold text-xl text-gray-900">
                        {result.extractedAmount ? formatCurrency(result.extractedAmount) : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1">
                        <Calendar size={12} /> Date
                      </p>
                      <p className="font-medium text-gray-900">{result.transactionDate || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1">
                        <Receipt size={12} /> Type
                      </p>
                      <p className="font-medium text-gray-900">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {result.receiptType || 'GENERAL'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extracted Text Preview */}
              {result.extractedText && (
                <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                  <div className="px-5 py-3 bg-gray-100/50 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FileText size={14} />
                      Raw Extracted Text
                    </h4>
                  </div>
                  <div className="p-5 max-h-48 overflow-y-auto">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap font-mono">
                      {result.extractedText}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                    setResult(null);
                    setStep('upload');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  <Upload size={18} />
                  Upload Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes zoom-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-in {
          animation: fade-in 0.2s ease-out, zoom-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ReceiptUploadModal;
