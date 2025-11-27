const api = {
  list: '/api/products',
  upload: '/api/upload',
  edit: id => `/api/edit/${id}`,
  del: id => `/api/delete/${id}`
};

// client listing
async function loadClient(){
  const el = document.getElementById('listing');
  if (!el) return;
  try{
    const res = await fetch(api.list);
    const items = await res.json();
    if (!items.length) { el.innerHTML = '<p>No products.</p>'; return; }
    el.innerHTML = items.map(p=>`
      <div class="product">
        <img src="${p.image}" alt="">
        <div>
          <h3>${p.title}</h3>
          <p class="small">₹ ${p.price} — ${p.available? 'In stock':'Out of stock'}</p>
          <p>${p.desc}</p>
        </div>
      </div>
    `).join('');
  }catch(e){ el.innerHTML = '<p>Error loading products.</p>'; }
}

// admin functions
async function loadAdmin(){
  const el = document.getElementById('productsAdmin');
  if (!el) return;
  try{
    const res = await fetch(api.list);
    const items = await res.json();
    if (!items.length) { el.innerHTML = '<p>No products.</p>'; return; }
    el.innerHTML = items.map(p=>`
      <div class="product">
        <img src="${p.image}" alt="">
        <div>
          <h3>${p.title}</h3>
          <p class="small">₹ ${p.price}</p>
          <p>${p.desc}</p>
          <div class="actions">
            <button onclick="editPrompt('${p.id}')">Edit</button>
            <button onclick="deleteItem('${p.id}')">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }catch(e){ el.innerHTML = '<p>Error loading products.</p>'; }
}

// upload form
const uploadForm = document.getElementById('uploadForm');
if (uploadForm){
  uploadForm.addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    const fd = new FormData(uploadForm);
    fd.set('available', uploadForm.available.checked ? 'true' : 'false');
    const btn = uploadForm.querySelector('button');
    btn.disabled = true; btn.textContent = 'Uploading...';
    try{
      const res = await fetch(api.upload, { method:'POST', body: fd });
      const j = await res.json();
      if (j.success){ uploadForm.reset(); loadAdmin(); loadClient(); }
      else alert('Upload failed');
    }catch(e){ alert('Error'); }
    btn.disabled = false; btn.textContent = 'Upload';
  });
}

// delete
async function deleteItem(id){
  if(!confirm('Delete this product?')) return;
  try{
    const res = await fetch(api.del(id), { method:'DELETE' });
    const j = await res.json();
    if (j.success) loadAdmin(), loadClient(); else alert('Delete failed');
  }catch(e){ alert('Error'); }
}

// edit prompt (simple)
function editPrompt(id){
  const title = prompt('New title (leave blank to keep)');
  if (title === null) return; // cancel
  const price = prompt('New price (leave blank to keep)');
  if (price === null) return;
  const desc = prompt('New description (leave blank to keep)');
  if (desc === null) return;
  const avail = confirm('Set available? OK=available, Cancel=not available');

  const fd = new FormData();
  if (title) fd.append('title', title);
  if (price) fd.append('price', price);
  if (desc) fd.append('desc', desc);
  fd.append('available', avail ? 'true' : 'false');

  fetch(api.edit(id), { method:'POST', body: fd })
    .then(r=>r.json())
    .then(j=>{ if (j.success) loadAdmin(), loadClient(); else alert('Edit failed'); })
    .catch(()=>alert('Error'));
}

// initialize
loadClient();
loadAdmin();
