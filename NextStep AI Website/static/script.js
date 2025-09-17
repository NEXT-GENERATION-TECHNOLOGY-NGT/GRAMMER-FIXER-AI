const modal = document.getElementById("authModal");
const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");
const formSection = document.getElementById("formSection");

// ===== MODAL ===== 
function openModal(show = "signup") {
  modal.style.display = "flex";
  if (show == "login") {
    loginModal.style.display = "block";
    signupModal.style.display = "none"
  } else {
    signupModal.style.display = "block";
    loginModal.style.display = "none";
  }
}

function closeModal() {
  modal.style.display = "none";
}

function switchToSignup() {
  loginModal.style.display = "none";
  signupModal.style.display = "block";

  toggleDisabilityOptions();
}

function switchToLogin() {
  signupModal.style.display = "none";
  loginModal.style.display = "block";
}

// ===== DISABILITY OPTIONS =====
function toggleDisabilityOptions() {
  const select = document.getElementById("disabilitySelect");
  const options = document.getElementById("disabilityOptions");
  if (!select || !options) return;

  options.style.display = select.value === "yes" ? "flex" : "none";
}

// ===== VALIDATE SA ID ======
function validateSAID(id) {
  if (!/^\d{13}$/.test(id)) return false;

  const yy = parseInt(id.substring(0, 2), 10);
  const mm = parseInt(id.substring(2, 4), 10);
  const dd = parseInt(id.substring(4, 6), 10);

  const currentYear = new Date().getFullYear() % 100;
  const century = yy <= currentYear ? 2000 : 1900;
  const birthYear = century + yy;

  const birthDate = new Date(birthYear, mm - 1, dd);
  if (
    birthDate.getFullYear() !== birthYear ||
    birthDate.getMonth() + 1 !== mm ||
    birthDate.getDate() !== dd
  ) return false;

  const genderCode = parseInt(id.substring(6, 10), 10);
  const gender = genderCode < 5000 ? "Female" : "Male";

  let sum = 0;
  let alt = false;
  for (let i = id.length - 1; i >= 0; i--) {
      let num = parseInt(id.charAt(i), 10);
      if (alt) { num *= 2; if(num > 9) num -= 9; }
      sum += num;
      alt = !alt;
  }
  if (sum % 10 !== 0) return false;

  const today = new Date();
  let age = today.getFullYear() - birthYear;
  const hasHadBirthday =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!hasHadBirthday) age--;

  return { gender, age };
}

// ===== FILL FORM =====
function fillForm(user, idInfo) {
  document.getElementById("studentName").value = user.name;
  document.getElementById("studentID").value = user.id;
  document.getElementById("formMatricYear").value = user.matric_year || '';
  document.getElementById("studentGender").value = idInfo.gender;
  document.getElementById("studentAge").value = idInfo.age;

  modal.style.display = "none";
  formSection.style.display = "block";

  document.getElementById("displayName").innerText = user.name;
  document.getElementById("authButtons").style.display = "none";
  document.getElementById("userName").style.display = "flex";

  // show the RESULTS nav
  document.getElementById("resultsNav").style.display = "inline-block";
}


// ===== LOGIN =====
async function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  

  if (!email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  const response = await fetch("/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},  
    body: JSON.stringify({email, password}),
    credentials: "same-origin"
  });

  const result = await response.json();

  if(result.success) {
    const user = result.user;
    const idInfo = validateSAID(user.id);

    document.getElementById("resultsLink").style.display = "inline-block";

    if (!idInfo) { 
      alert("Invalid SA ID"); 
      return; 
    }
    
    fillForm(user, idInfo);
  } else {
    alert(result.message)
  }
}

// ===== SIGN UP =====
async function handleSignup() {
  const name = document.getElementById("signupName").value.trim();
  const id = document.getElementById("signupID").value.trim();
  const matricYear = document.getElementById("matricYear").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const pass = document.getElementById("signupPassword").value.trim();
  const confirmPass = document.getElementById("confirmPassword").value.trim();

  if (!/^[A-Za-z\s]+$/.test(name)) {
    alert("Name MUST contain Alphabets & Spaces");
    return;
  }

  const idInfo = validateSAID(id);
  if (!idInfo) {
    alert("Invalid South African ID number.");
    return;
  }

  if (!matricYear) {
    alert("Enter your matric year.");
    return;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@((gmail\.com)|(icloud\.com)|(me\.com)|(mac\.com)|([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))$/i;
  if (!emailRegex.test(email)) {
    alert("Enter a valid Google or iCloud email address.");
    return;
  }

  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  if (!passRegex.test(pass)) {
    alert("Password must be at least 8 characters and include:\n- 1 uppercase\n- 1 lowercase\n- 1 number\n- 1 special character");
    return;
  }

  if (pass !== confirmPass) {
    alert("Passwords do not match.");
    return;
  }

// txt file DataBase
  const response = await fetch("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, id, matricYear, email, password: pass }),
    credentials: "same-origin"
  });

  const result = await response.json();
  alert(result.message);

  // After signup, simulate login
  if (result.success) {
    const user = result.user || {name, id, matricYear: matricYear};
    fillForm(user, idInfo);
    alert(`Signup successful!\nGender: ${idInfo.gender}\nAge: ${idInfo.age}`);
  }
}

function handleLogout() {
  fetch("/logout", { credentials: 'same-origin' })
  .then(() => {
      // Reset UI
      document.getElementById("authButtons").style.display = "flex";
      document.getElementById("userName").style.display = "none";

      // Hide form section
      formSection.style.display = "none";

      // hide results nav
      document.getElementById("resultsNav").style.display = "none"
  });
}


// ===== SEARCH (in body)=====
function startSearch() {
  if (document.getElementById("userName").style.display === "none") {
    openModal();
  } else {
    formSection.style.display = "block";
  }
}

function clampNumeric(el, min, max) {
  el.addEventListener('input', () => {
    if (el.value === '') return;
    const v = parseInt(el.value, 10);
    if (isNaN(v)) { el.value = ''; return; }
    if (v > max) el.value = String(max);
    else if (v < min) el.value = String(min);
  });
  el.addEventListener('blur', () => {
    if (el.value === '') return;
    let v = parseInt(el.value, 10);
    if (isNaN(v)) v = min;
    if (v > max) v = max;
    if (v < min) v = min;
    el.value = String(v);
  });

  // No notation & signs in number inputs
  el.addEventListener('keydown', (e) => {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
  });
}


// ===== SUBJECT HANDLING =====
function addSubject(subject, selectElement) {
  if (!subject) return;

  const table = document.getElementById('subjectTable');
  const rowCount = table.rows.length - 1; // exclude header

  // Max 12 subjects
  if (rowCount >= 12) {
    alert('You can only select up to 12 subjects.');
    if (selectElement) selectElement.value = '';
    return;
  }

  // Prevent duplicates
  for (let i = 1; i < table.rows.length; i++) {
    if (table.rows[i].cells[0].innerText === subject) {
      alert(subject + ' already added!');
      if (selectElement) selectElement.value = '';
      return;
    }
  }

  // Build row with real DOM nodes (so listeners work reliably)
  const row = table.insertRow();
  const c1 = row.insertCell(0);
  const c2 = row.insertCell(1);
  const c3 = row.insertCell(2);
  const c4 = row.insertCell(3);

  c1.textContent = subject;

  // Marks: 0–100
  const marksInput = document.createElement('input');
  marksInput.type = 'number';
  marksInput.placeholder = '%';
  marksInput.min = '0';
  marksInput.max = '100';
  marksInput.step = '1';
  marksInput.inputMode = 'numeric';
  marksInput.pattern = '\\d*';
  clampNumeric(marksInput, 0, 100);
  c2.appendChild(marksInput);

  // APS: 1–7
  const apsInput = document.createElement('input');
  apsInput.type = 'number';
  apsInput.placeholder = 'APS';
  apsInput.min = '1';
  apsInput.max = '7';
  apsInput.step = '1';
  apsInput.inputMode = 'numeric';
  apsInput.pattern = '\\d*';
  clampNumeric(apsInput, 1, 7);
  c3.appendChild(apsInput);

  // remove button
  const btn = document.createElement('button');
  btn.className = 'remove-btn';
  btn.textContent = 'X';
  btn.addEventListener('click', () => row.remove());
  c4.appendChild(btn);

  if (selectElement) selectElement.value = '';
}

function removeRow(btn) {
  let row = btn.parentNode.parentNode;
  row.parentNode.removeChild(row);
}

// Validate subject count on search
function validateSubjects() {
  let table = document.getElementById("subjectTable");
  let rows = table.getElementsByTagName("tr");

  if (rows.length <= 1) {
    alert("Add at least 7 subjects before searching.");
    return;
  }
  if (rows.length > 12) {
    alert("You cannot select more than 12 subjects.");
    return;
  }

  let subjects = [];
  for (let i = 1; i < rows.length; i++) {
    let cols = rows[i].getElementsByTagName("td");
    if (cols.length > 0) {
      subjects.push({
        name: cols[0].innerText,
        marks: cols[1].innerText,
        aps: cols[2].innerText
      })
    }
  }

  //save subjects
  fetch("/save_subjects", {
    method:"POST",
    headers:{"Content-Type": "application/json"},
    body: JSON.stringify({subjects: subjects})
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      window.location.href = "/results";
    } else {
      alert(data.message);
    }
  });
}

// ===== run on a load =====
window.addEventListener("DOMContentLoaded", () => {
  fetch("/get_subjects")
    .then(res => res.json())
    .then(data => {
      if (data.success && data.subjects.length > 0) {
        document.getElementById("resultsPlaceholder").style.display = "none";
        let table = document.getElementById("resultsTable");
        document.getElementById("resultsTableSection").style.display = "block";

        data.subjects.forEach(subj => {
          let row = table.insertRow();
          row.insertCell(0).innerText = subj.name;
          row.insertCell(1).innerText = subj.marks;
          row.insertCell(2).innerText = subj.aps;
        });
      }
    });
});  