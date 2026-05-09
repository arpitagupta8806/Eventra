// ─── NAVIGATION ───
let currentScreen = 'dashboard';
let chartInstances = {};

function goTo(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + id);
  if (target) { target.classList.add('active'); currentScreen = id; }

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const map = {
    dashboard: 0, events: 1, calendar: 2,
    budget: 3, expenses: 4, receipts: 5, tasks: 6,
    volunteers: 7, guests: 8,
    analytics: 9, reports: 10, ai: 11,
    notifications: 12, settings: 13
  };
  const navItems = document.querySelectorAll('.nav-item');
  if (map[id] !== undefined && navItems[map[id]]) navItems[map[id]].classList.add('active');

  // Init charts
  if (id === 'budget') { setTimeout(() => { initBurnChart(); initDonutChart(); }, 100); }
  if (id === 'analytics') { setTimeout(() => { initAnalyticsCharts(); }, 100); }
  if (id === 'ai') { setTimeout(() => { initAiChart(); }, 100); }
}

// ─── ROLE SWITCHING ───
const roleLabels = {
  coordinator: 'Event Coordinator',
  finance: 'Finance Manager',
  faculty: 'Faculty Advisor',
  volunteer: 'Volunteer'
};

function switchRole(role) {
  document.querySelectorAll('.role-pill').forEach(p => p.classList.remove('active'));
  const btn = document.getElementById('role-btn-' + role);
  if (btn) btn.classList.add('active');
  document.getElementById('role-label').textContent = roleLabels[role];

  const lbl = document.getElementById('settings-role-label');
  if (lbl) lbl.textContent = roleLabels[role];

  const sel = document.getElementById('roleSelect');
  if (sel) sel.value = role;

  const approvalCard = document.getElementById('approvalCard');
  if (approvalCard) approvalCard.style.display = (role === 'finance' || role === 'faculty') ? 'block' : 'none';
}

function switchRoleFromSettings(role) { switchRole(role); }

// ─── TASK TOGGLE ───
function toggleCheck(el) {
  el.classList.toggle('checked');
  const title = el.closest('.task-row')?.querySelector('.task-title');
  if (title) title.classList.toggle('done');
}

// ─── MODALS ───
const modals = {
  createEvent: {
    title: 'Create New Event',
    body: `
      <div style="display:flex;gap:8px;margin-bottom:18px">
        <div style="flex:1;padding:12px;border:2px solid var(--p600);border-radius:var(--radius);background:var(--p50);text-align:center;cursor:pointer"><div style="font-size:18px">🎭</div><div style="font-size:12px;font-weight:600;color:var(--p700)">Cultural Fest</div></div>
        <div style="flex:1;padding:12px;border:1px solid var(--border);border-radius:var(--radius);text-align:center;cursor:pointer"><div style="font-size:18px">🎓</div><div style="font-size:12px;color:var(--g500)">Conference</div></div>
        <div style="flex:1;padding:12px;border:1px solid var(--border);border-radius:var(--radius);text-align:center;cursor:pointer"><div style="font-size:18px">🔧</div><div style="font-size:12px;color:var(--g500)">Workshop</div></div>
        <div style="flex:1;padding:12px;border:1px solid var(--border);border-radius:var(--radius);text-align:center;cursor:pointer"><div style="font-size:18px">📢</div><div style="font-size:12px;color:var(--g500)">Seminar</div></div>
      </div>
      <div class="form-row"><div class="form-group"><div class="form-label">Event Name</div><input class="form-input" placeholder="e.g. HIBS 2025"></div><div class="form-group"><div class="form-label">Department</div><input class="form-input" value="School of Management"></div></div>
      <div class="form-row"><div class="form-group"><div class="form-label">Start Date</div><input class="form-input" type="date" value="2025-12-09"></div><div class="form-group"><div class="form-label">End Date</div><input class="form-input" type="date" value="2025-12-11"></div></div>
      <div class="form-group"><div class="form-label">Venue</div><input class="form-input" placeholder="e.g. Main Auditorium, IIT Mandi"></div>
      <div class="form-row"><div class="form-group"><div class="form-label">Total Budget (₹)</div><input class="form-input" type="number" placeholder="12000" style="font-size:16px;font-weight:600"></div><div class="form-group"><div class="form-label">Expected Attendance</div><input class="form-input" type="number" placeholder="350"></div></div>
      <div style="padding:12px;background:var(--p50);border-radius:var(--radius);border:1px solid var(--p100);font-size:12px;color:var(--p700);margin-top:4px"><i class="ti ti-sparkles"></i> AI suggests <strong>₹11,200</strong> for a Cultural Fest of this size based on 6 historical events. <a href="#" onclick="closeModal()" style="color:var(--p600);font-weight:500">Apply suggestion →</a></div>`,
    footer: '<button class="btn btn-secondary" onclick="closeModal()">Save as Draft</button><button class="btn btn-primary" onclick="closeModal()"><i class="ti ti-check"></i> Create Event</button>'
  },
  addExpense: {
    title: 'Add Expense',
    body: `
      <div class="form-row"><div class="form-group"><div class="form-label">Amount (₹)</div><input class="form-input" type="number" placeholder="0.00" style="font-size:20px;font-weight:600"></div><div class="form-group"><div class="form-label">Category</div><select class="form-input"><option>Cultural</option><option>Hospitality</option><option>Stage Mgmt</option><option>Volunteers</option><option>Misc</option></select></div></div>
      <div class="form-group"><div class="form-label">Description</div><input class="form-input" placeholder="What was this expense for?"></div>
      <div class="form-row"><div class="form-group"><div class="form-label">Date</div><input class="form-input" type="date" value="2024-12-09"></div><div class="form-group"><div class="form-label">Vendor / Merchant</div><input class="form-input" placeholder="e.g. M/s Audio Plus"></div></div>
      <div style="border:2px dashed var(--border);border-radius:var(--radius);padding:20px;text-align:center;cursor:pointer;transition:border-color 0.15s" onmouseover="this.style.borderColor='var(--p400)'" onmouseout="this.style.borderColor='var(--border)'">
        <i class="ti ti-scan" style="font-size:28px;color:var(--p300);display:block;margin-bottom:6px"></i>
        <div style="font-size:13px;font-weight:500;color:var(--g700)">Scan or upload receipt</div>
        <div style="font-size:11px;color:var(--g400);margin-top:2px">OCR will auto-fill amount and merchant name</div>
      </div>`,
    footer: '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="closeModal()"><i class="ti ti-check"></i> Save Expense</button>'
  },
  addTask: {
    title: 'Create Task',
    body: `
      <div class="form-group"><div class="form-label">Task Title</div><input class="form-input" placeholder="e.g. Confirm catering headcount"></div>
      <div class="form-row"><div class="form-group"><div class="form-label">Assign To</div><input class="form-input" placeholder="Search team member..."></div><div class="form-group"><div class="form-label">Department</div><select class="form-input"><option>Stage Management</option><option>Cultural</option><option>Hospitality</option><option>General</option></select></div></div>
      <div class="form-row"><div class="form-group"><div class="form-label">Due Date</div><input class="form-input" type="date" value="2024-12-09"></div><div class="form-group"><div class="form-label">Due Time</div><input class="form-input" type="time" value="12:00"></div></div>
      <div class="form-group"><div class="form-label">Priority</div><div style="display:flex;gap:8px"><button class="btn btn-secondary btn-sm" onclick="setPriority(this)">Low</button><button class="btn btn-secondary btn-sm" onclick="setPriority(this)" style="background:#FEF9C3;border-color:#FDE047;color:#A16207">Medium</button><button class="btn btn-secondary btn-sm" onclick="setPriority(this)">High</button></div></div>
      <div class="form-group"><div class="form-label">Notes (optional)</div><textarea class="form-input" style="height:70px" placeholder="Additional context for the assignee..."></textarea></div>`,
    footer: '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="closeModal()"><i class="ti ti-check"></i> Create Task</button>'
  },
  scanReceipt: {
    title: 'Scan Receipt',
    body: `
      <div class="scan-frame">
        <div class="scan-corner tl"></div><div class="scan-corner tr"></div>
        <div class="scan-corner bl"></div><div class="scan-corner br"></div>
        <div class="scan-line"></div>
        <div style="text-align:center">
          <i class="ti ti-scan" style="font-size:40px;color:rgba(255,255,255,.2);display:block;margin-bottom:8px"></i>
          <div class="scan-text">Position receipt within frame</div>
        </div>
      </div>
      <div style="margin:14px 0;padding:12px;background:var(--t50);border-radius:var(--radius);border:1px solid var(--t100)">
        <div style="font-size:12px;font-weight:600;color:var(--t600);margin-bottom:4px"><i class="ti ti-sparkles"></i> OCR Detected</div>
        <div style="font-size:13px;color:var(--g800)">Amount: <strong>₹1,200</strong> · Merchant: M/s Audio Plus · Date: Dec 7</div>
      </div>
      <div class="form-row"><div class="form-group"><div class="form-label">Amount (₹) — pre-filled</div><input class="form-input" value="1200" style="font-size:16px;font-weight:600"></div><div class="form-group"><div class="form-label">Category</div><select class="form-input"><option>Cultural</option><option>Hospitality</option><option>Stage Mgmt</option></select></div></div>
      <div class="form-group"><div class="form-label">Description</div><input class="form-input" value="Audio equipment rental — M/s Audio Plus"></div>`,
    footer: '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="closeModal()"><i class="ti ti-send"></i> Submit for Approval</button>'
  },
  inviteVol: {
    title: 'Invite Volunteer',
    body: `
      <div style="padding:14px;background:var(--p50);border-radius:var(--radius);border:1px solid var(--p100);margin-bottom:16px">
        <div style="font-size:13px;font-weight:600;color:var(--p800);margin-bottom:6px">Share invite link</div>
        <div style="font-family:var(--mono);font-size:12px;background:var(--white);padding:8px 12px;border-radius:6px;border:1px solid var(--border);margin-bottom:8px;color:var(--g700)">eventra.app/join/HIBS2024/v8x2k</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary btn-sm"><i class="ti ti-copy"></i> Copy Link</button>
          <button class="btn btn-secondary btn-sm"><i class="ti ti-brand-whatsapp"></i> WhatsApp</button>
          <button class="btn btn-secondary btn-sm"><i class="ti ti-mail"></i> Email</button>
        </div>
      </div>
      <div style="font-size:12px;font-weight:500;color:var(--g400);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px">Or invite directly</div>
      <div class="form-group"><div class="form-label">Email address</div><input class="form-input" placeholder="volunteer@iitmandi.ac.in"></div>
      <div class="form-row"><div class="form-group"><div class="form-label">Full Name</div><input class="form-input" placeholder="Full name"></div><div class="form-group"><div class="form-label">Department</div><select class="form-input"><option>Stage Management</option><option>Cultural</option><option>Hospitality</option><option>General</option></select></div></div>`,
    footer: '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="closeModal()"><i class="ti ti-send"></i> Send Invite</button>'
  },
  addGuest: {
    title: 'Add Guest',
    body: `
      <div class="form-row"><div class="form-group"><div class="form-label">Full Name</div><input class="form-input" placeholder="Dr. Anand Sharma"></div><div class="form-group"><div class="form-label">Role at Event</div><select class="form-input"><option>Keynote Speaker</option><option>Panelist</option><option>Sponsor</option><option>Faculty</option><option>General Guest</option></select></div></div>
      <div class="form-group"><div class="form-label">Organisation</div><input class="form-input" placeholder="IITM Innovation Centre"></div>
      <div class="form-group"><div class="form-label">Email</div><input class="form-input" placeholder="guest@institution.ac.in" type="email"></div>
      <div class="form-row"><div class="form-group"><div class="form-label">Check-in Date</div><input class="form-input" type="date"></div><div class="form-group"><div class="form-label">Check-out Date</div><input class="form-input" type="date"></div></div>
      <div class="form-row"><div class="form-group"><div class="form-label">Dietary Preference</div><select class="form-input"><option>No restriction</option><option>Vegetarian</option><option>Vegan</option><option>Jain</option></select></div><div class="form-group"><div class="form-label">Room Assignment</div><input class="form-input" placeholder="e.g. Room 204"></div></div>`,
    footer: '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="closeModal()"><i class="ti ti-user-plus"></i> Add Guest</button>'
  },
  volDetail: {
    title: 'Rahul Sharma — Tasks & Details',
    body: `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;padding:14px;background:var(--g50);border-radius:var(--radius)">
        <div class="avatar avatar-lg av-purple">RS</div>
        <div><div style="font-size:16px;font-weight:600;color:var(--g900)">Rahul Sharma</div><div style="font-size:13px;color:var(--g500)">Stage Management · IIT Mandi</div><div style="font-size:12px;color:var(--p600)">+91-98765XXXXX</div></div>
        <span class="badge badge-green" style="margin-left:auto">Confirmed</span>
      </div>
      <div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:12px;color:var(--g400);margin-bottom:6px"><span>Task completion</span><span>3 / 5 (60%)</span></div><div class="progress h-3"><div class="progress-bar bar-amber" style="width:60%"></div></div></div>
      <div style="font-size:12px;font-weight:600;color:var(--g400);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">Assigned Tasks</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div class="task-row"><div class="task-check checked" onclick="toggleCheck(this)"><i class="ti ti-check"></i></div><div class="task-body"><div class="task-title done">Set up mic stands</div><div class="task-meta"><div class="task-meta-item"><i class="ti ti-calendar"></i> Dec 8, 10 AM</div><span class="badge badge-green">Done</span></div></div></div>
        <div class="task-row"><div class="task-check checked" onclick="toggleCheck(this)"><i class="ti ti-check"></i></div><div class="task-body"><div class="task-title done">Coordinate with AV vendor</div><div class="task-meta"><div class="task-meta-item"><i class="ti ti-calendar"></i> Dec 8, 2 PM</div><span class="badge badge-green">Done</span></div></div></div>
        <div class="task-row"><div class="task-check checked" onclick="toggleCheck(this)"><i class="ti ti-check"></i></div><div class="task-body"><div class="task-title done">Stage setup complete</div><div class="task-meta"><div class="task-meta-item"><i class="ti ti-calendar"></i> Dec 8, 6 PM</div><span class="badge badge-green">Done</span></div></div></div>
        <div class="task-row"><div class="task-check" onclick="toggleCheck(this)"><i class="ti ti-check"></i></div><div class="task-body"><div class="task-title">Sound check with band</div><div class="task-meta"><div class="task-meta-item"><i class="ti ti-clock"></i> Dec 9, 8 AM</div><span class="task-priority tp-high">High</span></div></div></div>
        <div class="task-row"><div class="task-check" onclick="toggleCheck(this)"><i class="ti ti-check"></i></div><div class="task-body"><div class="task-title">Stage breakdown post-event</div><div class="task-meta"><div class="task-meta-item"><i class="ti ti-calendar"></i> Dec 9, 10 PM</div><span class="task-priority tp-low">Low</span></div></div></div>
      </div>`,
    footer: '<button class="btn btn-secondary" onclick="closeModal()">Close</button><button class="btn btn-primary"><i class="ti ti-plus"></i> Assign New Task</button>'
  },
  receiptDetail: {
    title: 'Receipt — Wireless Mic Rental',
    body: `
      <div style="background:var(--g50);border-radius:var(--radius-lg);padding:24px;text-align:center;margin-bottom:18px;border:1px solid var(--border)">
        <i class="ti ti-receipt-2" style="font-size:52px;color:var(--p200);display:block;margin-bottom:8px"></i>
        <div style="font-size:11px;color:var(--g400)">mic_rental_dec6.jpg · 245 KB</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:0">
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px"><span style="color:var(--g400)">Amount</span><span style="font-weight:600;font-size:16px">₹850</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px"><span style="color:var(--g400)">Merchant</span><span>M/s Audio Plus</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px"><span style="color:var(--g400)">Category</span><span>Cultural</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px"><span style="color:var(--g400)">Submitted by</span><span>Priya Rao</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px"><span style="color:var(--g400)">Submitted on</span><span>Dec 6, 12:30 PM</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:13px"><span style="color:var(--g400)">Status</span><span class="badge badge-amber">Pending Finance Review</span></div>
      </div>`,
    footer: '<button class="btn btn-success" onclick="closeModal()"><i class="ti ti-check"></i> Approve</button><button class="btn btn-danger" onclick="closeModal()"><i class="ti ti-x"></i> Reject</button><button class="btn btn-secondary" onclick="closeModal()">Close</button>'
  },
  reallocate: {
    title: 'Reallocate Budget',
    body: `
      <div style="padding:12px;background:var(--a50);border-radius:var(--radius);border:1px solid rgba(186,117,23,0.2);font-size:12px;color:var(--a600);margin-bottom:16px"><i class="ti ti-info-circle"></i> Cultural has only ₹200 remaining. Reallocating from Misc (₹1,500 available) is recommended.</div>
      <div class="form-row">
        <div class="form-group"><div class="form-label">From Category</div><select class="form-input"><option>Misc (₹1,500 available)</option><option>Volunteers (₹600 available)</option></select></div>
        <div class="form-group"><div class="form-label">To Category</div><select class="form-input"><option>Cultural (₹200 remaining)</option><option>Hospitality (₹500 remaining)</option></select></div>
      </div>
      <div class="form-group"><div class="form-label">Amount to Reallocate (₹)</div><input class="form-input" type="number" value="500" style="font-size:18px;font-weight:600"></div>
      <div class="form-group"><div class="form-label">Reason (required for audit trail)</div><textarea class="form-input" style="height:70px" placeholder="e.g. Additional mic equipment needed for Day 2 performances"></textarea></div>`,
    footer: '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="closeModal()"><i class="ti ti-arrows-exchange"></i> Confirm Reallocation</button>'
  },
  reportPreview: {
    title: 'Report Preview',
    body: `
      <div style="padding:16px;background:var(--g50);border-radius:var(--radius);text-align:center;margin-bottom:16px">
        <i class="ti ti-file-description" style="font-size:40px;color:var(--p300);display:block;margin-bottom:8px"></i>
        <div style="font-size:13px;font-weight:600">HIBS 2024 — Post-Event Budget Summary</div>
        <div style="font-size:11px;color:var(--g400);margin-top:2px">2 pages · Eventra + IIT Mandi branding</div>
      </div>
      <div style="display:flex;gap:10px;margin-bottom:14px">
        <button class="btn btn-primary" style="flex:1;justify-content:center"><i class="ti ti-download"></i> Download PDF</button>
        <button class="btn btn-secondary" style="flex:1;justify-content:center"><i class="ti ti-file-spreadsheet"></i> Excel</button>
      </div>
      <div class="form-group"><div class="form-label">Email directly to</div><input class="form-input" value="dr.puransingh@iitmandi.ac.in"></div>`,
    footer: '<button class="btn btn-secondary" onclick="closeModal()">Close</button><button class="btn btn-primary" onclick="closeModal()"><i class="ti ti-mail"></i> Send Report</button>'
  },
  switchEvent: {
    title: 'Switch Event',
    body: `
      <div style="display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;border:2px solid var(--p600);border-radius:var(--radius);background:var(--p50);cursor:pointer">
          <div style="width:38px;height:38px;background:linear-gradient(135deg,var(--p600),var(--p800));border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600">H</div>
          <div style="flex:1"><div style="font-size:13px;font-weight:600">HIBS 2024</div><div style="font-size:11px;color:var(--g400)">Dec 9–11 · Active</div></div>
          <i class="ti ti-check" style="color:var(--p600)"></i>
        </div>
        <div style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--border);border-radius:var(--radius);cursor:pointer;background:var(--white)" onclick="closeModal()">
          <div style="width:38px;height:38px;background:linear-gradient(135deg,var(--t400),var(--t600));border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600">E</div>
          <div style="flex:1"><div style="font-size:13px;font-weight:600">Exodia 2025</div><div style="font-size:11px;color:var(--g400)">Jan 15–17 · Planning</div></div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--border);border-radius:var(--radius);cursor:pointer;background:var(--white)" onclick="closeModal()">
          <div style="width:38px;height:38px;background:linear-gradient(135deg,#6B7280,#374151);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600">I</div>
          <div style="flex:1"><div style="font-size:13px;font-weight:600">Iqnitia 2024</div><div style="font-size:11px;color:var(--g400)">Nov 20 · Completed</div></div>
        </div>
        <button class="btn btn-secondary w-full" style="justify-content:center;margin-top:4px" onclick="openModal('createEvent')"><i class="ti ti-plus"></i> Create New Event</button>
      </div>`,
    footer: ''
  },
  addCategory: {
    title: 'Add Budget Category',
    body: `
      <div class="form-row"><div class="form-group"><div class="form-label">Category Name</div><input class="form-input" placeholder="e.g. Security"></div><div class="form-group"><div class="form-label">Budget Allocation (₹)</div><input class="form-input" type="number" placeholder="0"></div></div>
      <div class="form-group"><div class="form-label">Icon</div><div style="display:flex;gap:8px;flex-wrap:wrap">
        <span style="font-size:22px;cursor:pointer;padding:6px;border-radius:6px;border:2px solid var(--p600);background:var(--p50)">🛡️</span>
        <span style="font-size:22px;cursor:pointer;padding:6px;border-radius:6px;border:1px solid var(--border)">💡</span>
        <span style="font-size:22px;cursor:pointer;padding:6px;border-radius:6px;border:1px solid var(--border)">🖨️</span>
        <span style="font-size:22px;cursor:pointer;padding:6px;border-radius:6px;border:1px solid var(--border)">🚗</span>
        <span style="font-size:22px;cursor:pointer;padding:6px;border-radius:6px;border:1px solid var(--border)">📋</span>
      </div></div>`,
    footer: '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="closeModal()"><i class="ti ti-plus"></i> Add Category</button>'
  }
};

function openModal(type) {
  const m = modals[type];
  if (!m) return;
  document.getElementById('modalTitle').textContent = m.title;
  document.getElementById('modalBody').innerHTML = m.body;
  document.getElementById('modalFooter').innerHTML = m.footer;
  document.getElementById('modalBackdrop').classList.add('open');
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('modalBackdrop')) {
    document.getElementById('modalBackdrop').classList.remove('open');
  }
}

function openDetail(cat) {
  const details = {
    cultural: 'Cultural Expenses',
    hospitality: 'Hospitality Expenses',
    stage: 'Stage Management Expenses',
    volunteers: 'Volunteer Expenses',
    misc: 'Miscellaneous Expenses'
  };
  openModal('addCategory');
  document.getElementById('modalTitle').textContent = details[cat] + ' — Line Items';
  document.getElementById('modalBody').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <div><div style="font-size:24px;font-weight:700;color:var(--g900)">₹1,800</div><div style="font-size:12px;color:var(--g400)">spent of ₹2,000 budget · 90%</div></div>
      <span class="badge badge-red">Near limit</span>
    </div>
    <div class="progress h-3" style="margin-bottom:16px"><div class="progress-bar bar-red" style="width:90%"></div></div>
    <table class="data-table" style="border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">
      <thead><tr><th>Description</th><th>Amount</th><th>Date</th><th>Added by</th><th>Receipt</th></tr></thead>
      <tbody>
        <tr><td>Traditional Outfit</td><td class="font-semibold">₹200</td><td>Dec 5</td><td>Arpita</td><td><i class="ti ti-receipt-2" style="color:var(--t400)"></i></td></tr>
        <tr><td>Wireless Mic Rental</td><td class="font-semibold">₹850</td><td>Dec 6</td><td>Priya</td><td><i class="ti ti-receipt-2" style="color:var(--a400)"></i></td></tr>
        <tr><td>Stage Lighting</td><td class="font-semibold">₹450</td><td>Dec 6</td><td>Arpita</td><td><i class="ti ti-receipt-off" style="color:var(--g300)" title="No receipt"></i></td></tr>
        <tr><td>Sound System</td><td class="font-semibold">₹300</td><td>Dec 7</td><td>Priya</td><td><i class="ti ti-receipt-2" style="color:var(--t400)"></i></td></tr>
      </tbody>
    </table>
    <div style="margin-top:12px;padding:10px 12px;background:var(--r50);border-radius:var(--radius);border:1px solid #fca5a5;font-size:12px;color:var(--r600)">
      <i class="ti ti-alert-triangle"></i> Only ₹200 remaining. <a href="#" onclick="closeModal();openModal('reallocate')" style="color:var(--r600);font-weight:600;text-decoration:underline">Reallocate from Misc →</a>
    </div>`;
  document.getElementById('modalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeModal()">Close</button><button class="btn btn-primary" onclick="closeModal();openModal(\'addExpense\')"><i class="ti ti-plus"></i> Add Expense</button>';
}

function setPriority(btn) {
  btn.closest('.form-group').querySelectorAll('button').forEach(b => {
    b.style.background = ''; b.style.borderColor = ''; b.style.color = '';
    b.style.fontWeight = '';
  });
  btn.style.background = 'var(--p50)'; btn.style.borderColor = 'var(--p400)';
  btn.style.color = 'var(--p700)'; btn.style.fontWeight = '600';
}

// ─── CHIPS ───
document.querySelectorAll('.chips').forEach(group => {
  group.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (chip) {
      group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    }
  });
});

// ─── CHARTS ───
function destroyChart(id) { if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; } }

function initBurnChart() {
  destroyChart('burnChart'); destroyChart('donutChart');
  const ctx1 = document.getElementById('burnChart');
  const ctx2 = document.getElementById('donutChart');
  if (!ctx1 || !ctx2) return;

  chartInstances['burnChart'] = new Chart(ctx1, {
    type: 'line',
    data: {
      labels: ['Dec 1','Dec 2','Dec 3','Dec 4','Dec 5','Dec 6','Dec 7','Dec 8','Dec 9'],
      datasets: [
        { label: 'Planned Spend', data: [500,1000,1800,2800,4000,5500,7000,8500,10000], borderColor: '#AFA9EC', borderDash: [5,3], tension: 0.4, pointRadius: 2, fill: false },
        { label: 'Actual Spend', data: [0,0,200,800,1200,2450,3500,4500,5000], borderColor: '#534AB7', tension: 0.4, pointRadius: 3, fill: { target: 'origin', above: 'rgba(83,74,183,0.05)' }, borderWidth: 2.5 }
      ]
    },
    options: { responsive: true, interaction: { intersect: false, mode: 'index' }, plugins: { legend: { labels: { font: { size: 11, family: 'DM Sans' }, boxWidth: 14 } } }, scales: { x: { ticks: { font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.04)' } }, y: { ticks: { font: { size: 10 }, callback: v => '₹' + (v/1000).toFixed(0) + 'K' }, grid: { color: 'rgba(0,0,0,0.04)' }, max: 11000 } } }
  });

  chartInstances['donutChart'] = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: ['Cultural','Hospitality','Stage Mgmt','Volunteers','Misc'],
      datasets: [{ data: [1800,1500,780,400,500], backgroundColor: ['#E24B4A','#F59E0B','#1D9E75','#7F77DD','#9896AA'], borderWidth: 2, borderColor: '#fff', hoverBorderWidth: 3 }]
    },
    options: { responsive: true, cutout: '65%', plugins: { legend: { position: 'right', labels: { font: { size: 11, family: 'DM Sans' }, boxWidth: 12, padding: 10 } } } }
  });
}

let analyticsInit = false;
function initAnalyticsCharts() {
  if (analyticsInit) return;
  analyticsInit = true;

  const c1 = document.getElementById('eventBarChart');
  const c2 = document.getElementById('catDonutChart');
  const c3 = document.getElementById('trendChart');

  if (c1) chartInstances['eventBar'] = new Chart(c1, {
    type: 'bar',
    data: {
      labels: ['HIBS','Exodia','Iqnitia','TechFest','SomFest','Workshop'],
      datasets: [
        { label: 'Budget', data: [10000,15000,8000,12000,9000,4000], backgroundColor: 'rgba(175,169,236,0.5)', borderColor: '#AFA9EC', borderWidth: 1.5 },
        { label: 'Spent', data: [9200,14100,7800,11500,8700,3600], backgroundColor: 'rgba(83,74,183,0.8)', borderColor: '#534AB7', borderWidth: 1.5 }
      ]
    },
    options: { responsive: true, plugins: { legend: { labels: { font: { size: 11, family: 'DM Sans' }, boxWidth: 12 } } }, scales: { x: { ticks: { font: { size: 10 } }, grid: { display: false } }, y: { ticks: { font: { size: 10 }, callback: v => '₹'+v/1000+'K' }, grid: { color: 'rgba(0,0,0,0.04)' } } } }
  });

  if (c2) chartInstances['catDonut'] = new Chart(c2, {
    type: 'doughnut',
    data: {
      labels: ['Cultural (32%)','Hospitality (28%)','Stage (22%)','Volunteers (10%)','Misc (8%)'],
      datasets: [{ data: [32,28,22,10,8], backgroundColor: ['#E24B4A','#F59E0B','#1D9E75','#534AB7','#9896AA'], borderWidth: 2, borderColor: '#fff' }]
    },
    options: { responsive: true, cutout: '60%', plugins: { legend: { position: 'right', labels: { font: { size: 11, family: 'DM Sans' }, boxWidth: 12, padding: 10 } } } }
  });

  if (c3) chartInstances['trend'] = new Chart(c3, {
    type: 'line',
    data: {
      labels: ['Aug','Sep','Oct','Nov','Dec'],
      datasets: [{ label: 'Monthly Spend', data: [4000,9200,8000,22000,17200], borderColor: '#534AB7', backgroundColor: 'rgba(83,74,183,0.08)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#534AB7' }]
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.04)' } }, y: { ticks: { font: { size: 10 }, callback: v => '₹'+v/1000+'K' }, grid: { color: 'rgba(0,0,0,0.04)' } } } }
  });
}

let aiInit = false;
function initAiChart() {
  if (aiInit) return;
  aiInit = true;
  const ctx = document.getElementById('aiChart');
  if (!ctx) return;
  chartInstances['aiChart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['HIBS 2022','HIBS 2023','Iqnitia 2024','HIBS 2024 (Live)','Exodia 2025 (Pred.)'],
      datasets: [
        { label: 'Budget', data: [8500,9000,8000,10000,11200], backgroundColor: 'rgba(175,169,236,0.4)', borderColor: '#AFA9EC', borderWidth: 1.5 },
        { label: 'Actual/Predicted', data: [8200,8700,7800,5000,null], backgroundColor: 'rgba(83,74,183,0.75)', borderColor: '#534AB7', borderWidth: 1.5 },
        { label: 'AI Prediction', data: [null,null,null,null,11200], backgroundColor: 'rgba(127,119,221,0.4)', borderColor: '#7F77DD', borderWidth: 1.5, borderDash: [4,3] }
      ]
    },
    options: { responsive: true, plugins: { legend: { labels: { font: { size: 11, family: 'DM Sans' }, boxWidth: 12 } } }, scales: { x: { ticks: { font: { size: 9 } }, grid: { display: false } }, y: { ticks: { font: { size: 10 }, callback: v => '₹'+v/1000+'K' }, grid: { color: 'rgba(0,0,0,0.04)' } } } }
  });
}