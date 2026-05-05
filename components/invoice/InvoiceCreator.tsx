'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useReactToPrint } from 'react-to-print'
import toast from 'react-hot-toast'
import { Plus, Trash2, Download, Printer, RefreshCw, FileText, Loader2 } from 'lucide-react'
import { getCurrencySymbol, CURRENCIES } from '@/lib/utils'

/* ── Inline invoice preview (light, print-ready) ── */
function PrintableInvoice({ data }: { data: InvoiceData }) {
  const sym = getCurrencySymbol(data.currency)
  return (
    <div style={{ fontFamily: 'Inter,sans-serif', background: '#fff', padding: '40px', minHeight: 600 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, borderBottom: '2px solid #e1ecf3', paddingBottom: 16 }}>
        <div>
          {data.senderLogo && <img src={data.senderLogo} alt="logo" style={{ height: 48, marginBottom: 8, objectFit: 'contain' }} />}
          <div style={{ fontWeight: 800, fontSize: '1.8rem', letterSpacing: -1, color: '#0b3b4f' }}>INVOICE</div>
          <div style={{ fontSize: '0.75rem', color: '#6b8fa8' }}>#{data.invoiceNumber || 'DRAFT'}</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#3c6e8f' }}>
          <div><strong>Date:</strong> {data.invoiceDate || '—'}</div>
          <div><strong>Due:</strong> {data.dueDate || '—'}</div>
          {data.poNumber && <div><strong>PO:</strong> {data.poNumber}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 24, background: '#fbfeff', padding: '12px 16px', borderRadius: 12, marginBottom: 20, fontSize: '0.78rem' }}>
        <div style={{ flex: 1 }}><strong style={{ display: 'block', marginBottom: 4, color: '#2c5a77' }}>FROM</strong>
          <div style={{ color: '#1a4b66', fontWeight: 600 }}>{data.senderName || 'Your Company'}</div>
          <div style={{ color: '#5a7f99' }}>{data.senderAddress}</div>
          <div style={{ color: '#5a7f99' }}>{data.senderEmail}</div>
        </div>
        <div style={{ flex: 1 }}><strong style={{ display: 'block', marginBottom: 4, color: '#2c5a77' }}>BILL TO</strong>
          <div style={{ color: '#1a4b66', fontWeight: 600 }}>{data.clientName || 'Client Name'}</div>
          <div style={{ color: '#5a7f99' }}>{data.clientAddress}</div>
          <div style={{ color: '#5a7f99' }}>{data.clientEmail}</div>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', marginBottom: 16 }}>
        <thead><tr style={{ background: '#f4f9fe' }}>
          {['Item','Qty','Unit Price','Total'].map(h=><th key={h} style={{ padding: '8px 10px', fontWeight: 700, color: '#2c5a77', textAlign: h==='Item'?'left':'right' }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {data.items.length === 0
            ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20, color: '#9ab3c6' }}>No items added</td></tr>
            : data.items.map(it=>(
              <tr key={it.id} style={{ borderBottom: '1px solid #eef2f8' }}>
                <td style={{ padding: '8px 10px', color: '#1a4b66' }}>{it.name || '—'}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: '#3c6e8f' }}>{it.quantity}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', color: '#3c6e8f' }}>{sym}{it.unitPrice.toFixed(2)}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: '#1a4b66' }}>{sym}{(it.quantity*it.unitPrice).toFixed(2)}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <div style={{ display: 'inline-block', minWidth: 220, textAlign: 'left', fontSize: '0.82rem' }}>
          {[['Subtotal', `${sym}${data.subtotal.toFixed(2)}`], ['Tax', `${sym}${data.taxAmount.toFixed(2)}`], ['Discount', `-${sym}${data.discount.toFixed(2)}`]].map(([l,v])=>(
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#3c6e8f' }}><span>{l}</span><span>{v}</span></div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', borderTop: '2px solid #dae6f0', marginTop: 8, paddingTop: 8, color: '#0b3b4f' }}>
            <span>TOTAL</span><span>{sym}{data.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      {data.notes && <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px dashed #dce7f0', fontSize: '0.72rem', color: '#66809b' }}>{data.notes}</div>}
      <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.65rem', color: '#9ab3c6' }}>invoice-gen.net · smart invoice studio</div>
    </div>
  )
}

export interface InvoiceItem { id: string; name: string; description: string; quantity: number; unitPrice: number; taxRate: number; total: number }
export interface InvoiceData {
  invoiceNumber: string; brandColor: string; currency: string; language: 'en'|'bn'
  senderInfo: string; senderLogo: string; senderName: string; senderEmail: string; senderPhone: string
  senderAddress: string; senderWebsite: string; senderTaxId: string
  senderBankName: string; senderAccountNumber: string; senderSwift: string
  clientName: string; clientAddress: string; clientCompany: string; clientEmail: string
  clientPhone: string; clientWebsite: string; clientTaxId: string; clientContactPerson: string
  invoiceDate: string; paymentTerms: string; dueDate: string; poNumber: string
  items: InvoiceItem[]; discount: number; taxRate: number; shipping: number; amountPaid: number
  notes: string; terms: string; footerNote: string; subtotal: number; taxAmount: number; total: number
}

const mkItem = (): InvoiceItem => ({ id: Math.random().toString(36).slice(2), name: '', description: '', quantity: 1, unitPrice: 0, taxRate: 0, total: 0 })
const today = () => new Date().toISOString().split('T')[0]
const dueDay = () => new Date(Date.now()+30*86400000).toISOString().split('T')[0]

const blank = (): InvoiceData => ({
  invoiceNumber:'1', brandColor:'#1f6e8c', currency:'USD', language:'en',
  senderInfo:'', senderLogo:'', senderName:'', senderEmail:'', senderPhone:'',
  senderAddress:'', senderWebsite:'', senderTaxId:'',
  senderBankName:'', senderAccountNumber:'', senderSwift:'',
  clientName:'', clientAddress:'', clientCompany:'', clientEmail:'',
  clientPhone:'', clientWebsite:'', clientTaxId:'', clientContactPerson:'',
  invoiceDate: today(), paymentTerms:'Net 30', dueDate: dueDay(), poNumber:'',
  items:[mkItem()], discount:0, taxRate:0, shipping:0, amountPaid:0,
  notes:'', terms:'', footerNote:'', subtotal:0, taxAmount:0, total:0,
})

function calcAll(items: InvoiceItem[], discount: number, taxRate: number, shipping: number) {
  const subtotal = items.reduce((a,i)=>a+i.quantity*i.unitPrice,0)
  const taxAmount = subtotal*(taxRate/100)
  const total = Math.max(0, subtotal+taxAmount+shipping-discount)
  return { subtotal, taxAmount, total }
}

/* ── Styles ── */
const inp = 'w-full px-3.5 py-2.5 rounded-[18px] border border-[#dee7ef] bg-white text-[0.9rem] font-[Inter,sans-serif] outline-none transition focus:border-[#2c7da0] focus:ring-2 focus:ring-[#2c7da0]/20'
const lbl = 'block text-[0.7rem] font-bold uppercase tracking-[0.8px] text-[#4e7b9b] mb-1.5'

export default function InvoiceCreator() {
  const [data, setData] = useState<InvoiceData>(blank)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewScale, setPreviewScale] = useState(0.55)
  const printRef = useRef<HTMLDivElement>(null)
  const printContainerRef = useRef<HTMLDivElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    const upd=()=>{ if(previewRef.current){ const w=previewRef.current.clientWidth-48; setPreviewScale(Math.min(Math.max(w/794,0.35),0.85)) } }
    upd(); window.addEventListener('resize',upd); return()=>window.removeEventListener('resize',upd)
  },[])

  const set = <K extends keyof InvoiceData>(k:K,v:InvoiceData[K])=>setData(p=>({...p,[k]:v}))
  const recalc = useCallback((items:InvoiceItem[],discount=data.discount,taxRate=data.taxRate,shipping=data.shipping)=>{
    const {subtotal,taxAmount,total}=calcAll(items,discount,taxRate,shipping)
    setData(p=>({...p,items,discount,taxRate,shipping,subtotal,taxAmount,total}))
  },[data.discount,data.taxRate,data.shipping])

  const updItem=(id:string,patch:Partial<InvoiceItem>)=>{
    const items=data.items.map(i=>{ if(i.id!==id)return i; const u={...i,...patch}; u.total=u.quantity*u.unitPrice; return u })
    recalc(items)
  }
  const addItem=()=>recalc([...data.items,mkItem()])
  const removeItem=(id:string)=>recalc(data.items.filter(i=>i.id!==id))

  const handleLogo=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0]; if(!f)return
    const r=new FileReader(); r.onloadend=()=>set('senderLogo',r.result as string); r.readAsDataURL(f)
  }

  const handlePrint = useReactToPrint({ content:()=>printRef.current, documentTitle:`Invoice-${data.invoiceNumber}` })

  const sym = getCurrencySymbol(data.currency)

  const saveDraft=()=>{ localStorage.setItem('igDraft',JSON.stringify(data)); toast.success('Draft saved!') }
  const loadDraft=()=>{
    const raw=localStorage.getItem('igDraft')
    if(!raw){toast.error('No draft found');return}
    try{ setData(JSON.parse(raw)); toast.success('Draft loaded!') }catch{ toast.error('Error loading draft') }
  }
  const resetDemo=()=>{
    const d=blank()
    d.invoiceNumber='INV-2409-02'; d.senderName='CloudCraft Studio'; d.senderAddress='101 Design Street, San Francisco, CA'
    d.senderEmail='studio@cloudcraft.com'; d.clientName='Lumina Retail'; d.clientAddress='88 Commerce Ave, Austin, TX'
    d.clientEmail='billing@lumina.com'; d.taxRate=8.5; d.discount=0; d.notes='Thank you! Payment due within 14 days.'
    d.items=[
      {id:'1',name:'Strategy & consulting',description:'',quantity:1,unitPrice:1200,taxRate:0,total:1200},
      {id:'2',name:'Web development (3 pages)',description:'',quantity:1,unitPrice:890,taxRate:0,total:890},
      {id:'3',name:'SEO optimization',description:'',quantity:2,unitPrice:175,taxRate:0,total:350},
    ]
    const {subtotal,taxAmount,total}=calcAll(d.items,d.discount,d.taxRate,d.shipping)
    setData({...d,subtotal,taxAmount,total}); toast.success('Demo loaded!')
  }
  const autoNumber=()=>{ const n=new Date(); set('invoiceNumber',`INV-${n.getFullYear()}${String(n.getMonth()+1).padStart(2,'0')}-${Math.floor(Math.random()*899+100)}`) }

  const downloadPDF=async()=>{
    if(isGenerating)return
    if(!printRef.current||!printContainerRef.current){toast.error('Renderer not ready');return}
    setIsGenerating(true); const tid=toast.loading('Generating PDF…')
    const el=printRef.current; const ce=printContainerRef.current
    try{
      const {default:jsPDF}=await import('jspdf')
      const {default:html2canvas}=await import('html2canvas')
      ce.style.position='absolute'; ce.style.top='0px'; ce.style.left='-9999px'
      await new Promise(r=>setTimeout(r,400))
      const canvas=await html2canvas(el,{scale:2,useCORS:true,allowTaint:true,logging:false,backgroundColor:'#ffffff',width:794,windowWidth:794,scrollX:-9999,scrollY:0})
      ce.style.position='fixed'; ce.style.top='-9999px'; ce.style.left='-9999px'
      const img=canvas.toDataURL('image/png')
      const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'})
      const pw=pdf.internal.pageSize.getWidth(); const ph=pdf.internal.pageSize.getHeight()
      const sh=(canvas.height*pw)/canvas.width
      if(sh<=ph+2){ pdf.addImage(img,'PNG',0,0,pw,Math.min(sh,ph),undefined,'FAST') }
      else{
        const pxpp=Math.floor((ph/sh)*canvas.height); let yPx=0,page=0
        while(yPx<canvas.height){
          const sl=Math.min(pxpp,canvas.height-yPx); if(sl<pxpp*0.12&&page>0)break
          const pc=document.createElement('canvas'); pc.width=canvas.width; pc.height=sl
          pc.getContext('2d')!.drawImage(canvas,0,yPx,canvas.width,sl,0,0,canvas.width,sl)
          if(page>0)pdf.addPage(); pdf.addImage(pc.toDataURL('image/png'),'PNG',0,0,pw,(sl*pw)/canvas.width,undefined,'FAST')
          yPx+=sl; page++
        }
      }
      const blob=pdf.output('blob'); const url=URL.createObjectURL(blob)
      const a=document.createElement('a'); a.href=url; a.download=`Invoice-${data.invoiceNumber}.pdf`
      document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(()=>URL.revokeObjectURL(url),2000)
      toast.success('PDF downloaded!',{id:tid})
    }catch(err){ console.error(err); toast.error('Failed to generate PDF',{id:tid})
    }finally{ if(printContainerRef.current){printContainerRef.current.style.position='fixed';printContainerRef.current.style.top='-9999px';printContainerRef.current.style.left='-9999px'} setIsGenerating(false) }
  }

  /* Hidden print target */
  const printTarget=(
    <div ref={printContainerRef} style={{position:'fixed',top:'-9999px',left:'-9999px',zIndex:-1,width:794}}>
      <div ref={printRef} style={{width:794}}><PrintableInvoice data={data}/></div>
    </div>
  )

  return (
    <div style={{fontFamily:'Inter,sans-serif',background:'radial-gradient(circle at 10% 30%,#f1f5f9,#e6edf4)',minHeight:'100vh',padding:'1.8rem 1.5rem',color:'#122c3f'}}>
      {printTarget}

      {/* Brand header */}
      <div style={{textAlign:'center',marginBottom:'2rem'}}>
        <div style={{display:'inline-block',background:'rgba(255,255,255,0.5)',backdropFilter:'blur(8px)',padding:'1rem 2rem',borderRadius:'4rem',boxShadow:'0 8px 20px rgba(0,0,0,0.04)'}}>
          <Link href="/" style={{display:'inline-flex',alignItems:'center',gap:12,fontWeight:800,fontSize:'2rem',background:'linear-gradient(125deg,#0b3b4f,#1f6e8c)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',textDecoration:'none',letterSpacing:'-0.3px'}}>
            <FileText size={32} color="#1f6e8c" style={{flexShrink:0}}/>
            invoice-gen.net
          </Link>
          <p style={{fontWeight:500,color:'#3c6e8f',fontSize:'0.85rem',marginTop:6}}>Intelligent invoicing · real-time preview · save &amp; manage drafts</p>
        </div>
      </div>

      {/* Dashboard grid */}
      <div style={{maxWidth:1500,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:'2rem'}}>

        {/* ── LEFT: EDITOR ── */}
        <div style={{background:'rgba(255,255,255,0.96)',borderRadius:'2rem',boxShadow:'0 25px 45px -12px rgba(0,0,0,0.12)',border:'1px solid rgba(255,255,255,0.7)',overflow:'hidden'}}>
          <div style={{padding:'1.2rem 1.8rem',background:'#ffffffd9',borderBottom:'1px solid #e9f0f5'}}>
            <h2 style={{fontSize:'1.3rem',fontWeight:600,display:'flex',alignItems:'center',gap:10,color:'#1a4b66'}}>
              <FileText size={20}/> Invoice Composer
            </h2>
          </div>
          <div style={{padding:'1.5rem 1.8rem'}}>

            {/* Invoice meta */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
              <div><label className={lbl}>Invoice #</label>
                <div style={{display:'flex',gap:6}}>
                  <input className={inp} value={data.invoiceNumber} onChange={e=>set('invoiceNumber',e.target.value)} placeholder="INV-001" style={{flex:1}}/>
                  <button onClick={autoNumber} title="Auto-generate" style={{padding:'8px 10px',borderRadius:14,border:'1px solid #bed3e3',background:'transparent',color:'#2b5d7a',cursor:'pointer'}}><RefreshCw size={14}/></button>
                </div>
              </div>
              <div><label className={lbl}>Issue Date</label><input type="date" className={inp} value={data.invoiceDate} onChange={e=>set('invoiceDate',e.target.value)}/></div>
              <div><label className={lbl}>Due Date</label><input type="date" className={inp} value={data.dueDate} onChange={e=>set('dueDate',e.target.value)}/></div>
              <div><label className={lbl}>Currency</label>
                <select className={inp} value={data.currency} onChange={e=>set('currency',e.target.value)}>
                  {CURRENCIES.map(c=><option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
                </select>
              </div>
            </div>

            {/* Logo */}
            <div style={{marginBottom:'1.2rem'}}>
              <label className={lbl}>Company Logo</label>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                {data.senderLogo
                  ? <><img src={data.senderLogo} alt="logo" style={{height:48,maxWidth:120,objectFit:'contain',borderRadius:8,border:'1px solid #e2edf5'}}/><button onClick={()=>set('senderLogo','')} style={{fontSize:'0.75rem',color:'#c2412c',background:'none',border:'none',cursor:'pointer'}}>Remove</button></>
                  : <button onClick={()=>logoInputRef.current?.click()} style={{padding:'8px 16px',borderRadius:14,border:'1px dashed #7fadcf',background:'#eef3fc',color:'#1f6e8c',fontWeight:600,fontSize:'0.8rem',cursor:'pointer'}}>Upload Logo</button>
                }
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogo}/>
              </div>
            </div>

            {/* Company & Client */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
              <div><label className={lbl}>Your Company</label><input className={inp} value={data.senderName} onChange={e=>set('senderName',e.target.value)} placeholder="Company Name"/></div>
              <div><label className={lbl}>Address</label><input className={inp} value={data.senderAddress} onChange={e=>set('senderAddress',e.target.value)} placeholder="Street, City"/></div>
              <div><label className={lbl}>Email / VAT</label><input className={inp} value={data.senderEmail} onChange={e=>set('senderEmail',e.target.value)} placeholder="contact@company.com"/></div>
              <div><label className={lbl}>Client Name</label><input className={inp} value={data.clientName} onChange={e=>set('clientName',e.target.value)} placeholder="Client Name"/></div>
              <div><label className={lbl}>Client Address</label><input className={inp} value={data.clientAddress} onChange={e=>set('clientAddress',e.target.value)} placeholder="Client address"/></div>
              <div><label className={lbl}>Client Email</label><input type="email" className={inp} value={data.clientEmail} onChange={e=>set('clientEmail',e.target.value)} placeholder="client@example.com"/></div>
            </div>

            {/* Line Items */}
            <div style={{marginBottom:'1rem'}}>
              <label className={lbl} style={{marginBottom:10}}>Line Items</label>
              <div style={{overflowX:'auto',borderRadius:'1.5rem',border:'1px solid #eff3f8'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.85rem'}}>
                  <thead><tr style={{background:'#fafdfe'}}>
                    <th style={{padding:'12px 8px',fontWeight:700,color:'#2c5a77',textAlign:'left'}}>Description</th>
                    <th style={{padding:'12px 8px',fontWeight:700,color:'#2c5a77',width:70}}>Qty</th>
                    <th style={{padding:'12px 8px',fontWeight:700,color:'#2c5a77',width:110}}>Unit Price</th>
                    <th style={{padding:'12px 8px',fontWeight:700,color:'#2c5a77',width:40}}></th>
                  </tr></thead>
                  <tbody>
                    {data.items.map(item=>(
                      <tr key={item.id} style={{borderBottom:'1px solid #eef2f8'}}>
                        <td style={{padding:8}}><input className={inp} style={{borderRadius:14}} value={item.name} onChange={e=>updItem(item.id,{name:e.target.value})} placeholder="Service / product"/></td>
                        <td style={{padding:8}}><input type="number" className={inp} style={{borderRadius:14,textAlign:'center'}} value={item.quantity} min={0} onChange={e=>updItem(item.id,{quantity:+e.target.value})}/></td>
                        <td style={{padding:8}}><input type="number" className={inp} style={{borderRadius:14,textAlign:'right'}} value={item.unitPrice} min={0} step={0.01} onChange={e=>updItem(item.id,{unitPrice:+e.target.value})}/></td>
                        <td style={{padding:8,textAlign:'center'}}>
                          <button onClick={()=>removeItem(item.id)} style={{background:'none',border:'none',color:'#c2412c',fontSize:'1.1rem',cursor:'pointer',padding:'6px',borderRadius:40,transition:'0.2s'}}><Trash2 size={15}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={addItem} style={{marginTop:12,background:'#eef3fc',border:'1px dashed #7fadcf',padding:'8px 20px',borderRadius:40,fontWeight:600,display:'inline-flex',alignItems:'center',gap:8,cursor:'pointer',color:'#1f6e8c',fontSize:'0.85rem'}}>
                <Plus size={15}/> Add new item
              </button>
            </div>

            {/* Tax & Discount */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
              <div><label className={lbl}>Tax Rate (%)</label><input type="number" className={inp} value={data.taxRate} step={0.1} onChange={e=>recalc(data.items,data.discount,+e.target.value,data.shipping)}/></div>
              <div><label className={lbl}>Discount ({sym})</label><input type="number" className={inp} value={data.discount} step={0.5} onChange={e=>recalc(data.items,+e.target.value,data.taxRate,data.shipping)}/></div>
            </div>

            {/* Notes */}
            <div style={{marginBottom:'1rem'}}>
              <label className={lbl}>Notes / Terms</label>
              <textarea className={inp} style={{borderRadius:18,resize:'vertical',minHeight:70}} value={data.notes} onChange={e=>set('notes',e.target.value)} placeholder="Payment terms, thank you message, etc..."/>
            </div>

            {/* Totals */}
            <div style={{background:'#f8fcfd',borderRadius:'1.5rem',padding:'1rem 1.2rem',marginBottom:'1.2rem',border:'1px solid #e2edf5'}}>
              {[['Subtotal',`${sym}${data.subtotal.toFixed(2)}`],['Tax',`${sym}${data.taxAmount.toFixed(2)}`],['Discount',`-${sym}${data.discount.toFixed(2)}`]].map(([l,v])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',fontSize:'0.9rem'}}><span>{l}</span><span>{v}</span></div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',fontWeight:800,fontSize:'1.2rem',borderTop:'2px solid #dae6f0',marginTop:8,paddingTop:10}}>
                <span>Total Amount</span><span>{sym}{data.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{display:'flex',flexWrap:'wrap',gap:12,marginBottom:8}}>
              <button onClick={saveDraft} style={{padding:'10px 18px',borderRadius:40,background:'#eef2f7',color:'#2b5d7a',fontWeight:600,fontSize:'0.8rem',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>💾 Save Draft</button>
              <button onClick={loadDraft} style={{padding:'10px 18px',borderRadius:40,background:'#eef2f7',color:'#2b5d7a',fontWeight:600,fontSize:'0.8rem',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>📁 Load Draft</button>
              <button onClick={resetDemo} style={{padding:'10px 18px',borderRadius:40,background:'transparent',border:'1px solid #bed3e3',color:'#2b5d7a',fontWeight:600,fontSize:'0.8rem',cursor:'pointer',display:'flex',alignItems:'center',gap:8}}><RefreshCw size={13}/> Reset Demo</button>
            </div>
            <p style={{fontSize:'0.7rem',color:'#5a7f99',textAlign:'center',marginTop:8}}>Drafts stored locally · all changes instant preview</p>
          </div>
        </div>

        {/* ── RIGHT: LIVE PREVIEW ── */}
        <div style={{background:'rgba(255,255,255,0.96)',borderRadius:'2rem',boxShadow:'0 25px 45px -12px rgba(0,0,0,0.12)',border:'1px solid rgba(255,255,255,0.7)',overflow:'hidden',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'1.2rem 1.8rem',background:'#ffffffd9',borderBottom:'1px solid #e9f0f5'}}>
            <h2 style={{fontSize:'1.3rem',fontWeight:600,display:'flex',alignItems:'center',gap:10,color:'#1a4b66'}}>
              👁 Live Invoice Preview
            </h2>
          </div>
          <div ref={previewRef} style={{flex:1,padding:'1.5rem',overflowY:'auto',background:'#f4f8fb'}}>
            <div style={{borderRadius:12,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.1)',width:`${794*previewScale}px`,minHeight:`${300*previewScale}px`}}>
              <div style={{transform:`scale(${previewScale})`,transformOrigin:'top left',width:794,pointerEvents:'none'}}>
                <PrintableInvoice data={data}/>
              </div>
            </div>
          </div>
          <div style={{padding:'1rem 1.5rem',borderTop:'1px solid #e9f0f5',background:'white',display:'flex',gap:10,flexWrap:'wrap'}}>
            <button onClick={()=>handlePrint()} style={{flex:1,padding:'12px',borderRadius:60,border:'none',background:'#eef2f7',color:'#1a5d7a',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontSize:'0.9rem'}}>
              <Printer size={16}/> Print
            </button>
            <button onClick={downloadPDF} disabled={isGenerating} style={{flex:2,padding:'12px',borderRadius:60,border:'none',background:'linear-gradient(95deg,#1f6e8c,#154e64)',color:'white',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,fontSize:'0.9rem',opacity:isGenerating?0.7:1}}>
              {isGenerating?<><Loader2 size={16} className="animate-spin"/>Generating…</>:<><Download size={16}/>Download PDF</>}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{textAlign:'center',marginTop:'2rem',fontSize:'0.75rem',color:'#7a9ab5'}}>
        <a href="https://invoice-gen.net" style={{color:'inherit'}}>invoice-gen.net</a> · &copy; {new Date().getFullYear()} · All rights reserved
      </div>
    </div>
  )
}
