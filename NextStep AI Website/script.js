const formSection = document.getElementById("formSection");

const modal = document.getElementById("authModal");

const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");

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

function toggleDisabilityOptions() {
  const select = document.getElementById("disabilitySelect");
  const options = document.getElementById("disabilityOptions");
  if (!select || !options) return;

  options.style.display = select.value === "yes" ? "flex" : "none";
}

function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  // reusing your auth logic idea
  document.getElementById("authButtons").style.display = "none";
  document.getElementById("userName").style.display = "block";
  document.getElementById("userName").innerText = email;

  modal.style.display = "none";
  formSection.style.display = "block";
}

/* SIGN UP */
function handleSignup() {
  const name = document.getElementById("signupName").value.trim();
  const id = document.getElementById("signupID").value.trim();
  const matricYear = document.getElementById("matricYear").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const pass = document.getElementById("signupPassword").value.trim();
  const confirmPass = document.getElementById("confirmPassword").value.trim();

  // reuse your name validation
  if (!/^[A-Za-z\s]+$/.test(name)) {
    alert("Name MUST contain Alphabets & Spaces");
    return;
  }

  /*
  // reuse your ID validation
  if (!/^\d+$/.test(id) || id.length !== 13) {
    alert("ID must be exactly 13 digits.");
    return;
  }*/

  // ✅ Validate SA ID properly
  const idInfo = validateSAID(id);
  if (!idInfo) {
    alert("Invalid South African ID number.");
    return;
  }

  if (!matricYear) {
    alert("Please enter your matric year.");
    return;
  }

  /*
  // ✅ Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }*/

  // Allow Gmail, Google Workspace, and iCloud emails
  const emailRegex = /^[a-zA-Z0-9._%+-]+@((gmail\.com)|(icloud\.com)|(me\.com)|(mac\.com)|([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))$/i;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid Google or iCloud email address.");
    return;
  }


  // Password strength validation
  // Must be at least 8 chars, include 1 lowercase, 1 uppercase, 1 digit, 1 special char
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  if (!passRegex.test(pass)) {
    alert("Password must be at least 8 characters and include:\n- 1 uppercase\n- 1 lowercase\n- 1 number\n- 1 special character");
    return;
  }

  if (pass !== confirmPass) {
    alert("Passwords do not match.");
    return;
  }

  // After signup, simulate login
  document.getElementById("studentName").value = name;
  document.getElementById("studentID").value = id;
  document.getElementById("matricYear").value = matricYear;
  document.getElementById("studentGender").value = idInfo.gender;
  document.getElementById("studentAge").value = idInfo.age;

  // Show gender & age (you can create read-only inputs in your form)
  alert(`Signup successful!\nGender: ${idInfo.gender}\nAge: ${idInfo.age}`);

  document.getElementById("authButtons").style.display = "none";
  document.getElementById("userName").style.display = "block";
  document.getElementById("userName").innerText = name;


  modal.style.display = "none";
  formSection.style.display = "block";
}

//Function Validate SA ID number 
function validateSAID(id) {
  if (!/^\d{13}$/.test(id)) return false;

  // 1. Extract date of birth
  const yy = parseInt(id.substring(0, 2), 10);
  const mm = parseInt(id.substring(2, 4), 10);
  const dd = parseInt(id.substring(4, 6), 10);

  // Assume 1900s/2000s
  const currentYear = new Date().getFullYear() % 100;
  const century = yy <= currentYear ? 2000 : 1900;
  const birthYear = century + yy;

  const birthDate = new Date(birthYear, mm - 1, dd);
  if (
    birthDate.getFullYear() !== birthYear ||
    birthDate.getMonth() + 1 !== mm ||
    birthDate.getDate() !== dd
  ) {
    return false; // invalid date
  }

  // Gender: digits 7–10 (index 6–9)
  const genderCode = parseInt(id.substring(6, 10), 10);
  const gender = genderCode < 5000 ? "Female" : "Male";


  // 2. Citizenship digit
  const citizenship = parseInt(id.charAt(10), 10);
  if (citizenship !== 0 && citizenship !== 1) {
    return false;
  }

  // 3. Luhn checksum validation
  let sum = 0;
  let alt = false;
  for (let i = id.length - 1; i >= 0; i--) {
    let num = parseInt(id.charAt(i), 10);
    if (alt) {
      num *= 2;
      if (num > 9) num -= 9;
    }
    sum += num;
    alt = !alt;
  }
  if (sum % 10 !== 0) return null;

  // Age
  const today = new Date();
  let age = today.getFullYear() - birthYear;
  const hasHadBirthday =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!hasHadBirthday) age--;

  return { birthDate, age, gender, citizenship: citizenship === 0 ? "Citizen" : "Resident" };

}

// SEARCH (in body)
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
  const table = document.getElementById("subjectTable");
  const rowCount = table.rows.length - 1; // exclude header

  if (rowCount < 7) {
    alert("You must select at least 7 subjects.");
    return;
  }

  if (rowCount > 12) {
    alert("You cannot select more than 12 subjects.");
    return;
  }

  alert("Subjects validated. Proceeding with search...");
  // 👉 place search logic here
}

async function search (userAPS, userSubjects) {
  const faculties = await loadFaculties(); // get data from Website A
  const qualifiedDiv = document.getElementById("qualified");
  const considerDiv = document.getElementById("consider");

  qualifiedDiv.innerHTML = "";
  considerDiv.innerHTML = "";

  const qualified = [];
  const borderline = [];

  faculties.forEach(faculty => {
    faculty.courses.forEach(course => {
      const hasSubject = course.requiredSubjects.some(sub =>
        userSubjects.includes(sub.toLowerCase())
      );

      if (hasSubject) {
        if (userAPS >= course.aps) qualified.push(course);
        else if (userAPS >= course.aps - 2) borderline.push(course);
      }
    });
  });

  // Render cards like before
  if (qualified.length > 0) {
    qualifiedDiv.innerHTML = "<h2>✅ Qualified Courses</h2>";
    qualified.forEach(item => qualifiedDiv.appendChild(renderCard(item)));
  }

  if (borderline.length > 0) {
    considerDiv.innerHTML = "<h2>⚠️ Consider These Options</h2>";
    borderline.forEach(item => considerDiv.appendChild(renderCard(item, true)));
  }

showResults(aps, subjects); 
}

