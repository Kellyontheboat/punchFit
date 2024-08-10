// LoginModal

export async function showLoginModal() {
  const loginModal = document.getElementById('loginModal')
  console.log(loginModal)
  // const registerModal = document.getElementById('registerModal');
  // const loginBtn = document.getElementById('login-modal-btn');
  // const registerBtn = document.getElementById('register-modal-btn');
  const signInForm = document.getElementById('signin-form-login')
  const passwordInput = document.getElementById('password')
  const msgSpanLogin = document.getElementById('login-msg')
  // const msgSpanRegister = document.getElementById('register-msg');

  const registeredEmail = localStorage.getItem('registeredEmail')
  // Pre-fill the email input if the user just registered
  if (registeredEmail) {
    const emailInput = signInForm.querySelector('input[name="email"]')
    emailInput.value = registeredEmail
    localStorage.removeItem('registeredEmail')
  }
  loginModal.style.display = 'block'
  // registerModal.style.display = 'none';
  passwordInput.value = ''
  msgSpanLogin.innerText = ''
  // registerBtn.addEventListener('click', function () {
  //   showRegisterModal();
  // });
  closeButtons()
}

// Close modal when clicking on the close button
async function closeButtons() {
  const closeButtons = document.querySelectorAll('.close')
  closeButtons.forEach(btn => {
    btn.addEventListener('click', function (event) {
      console.log(event.target)
      loginModal.style.display = 'none'
      // registerModal.style.display = 'none';
    })
  })
}

export function navScheduleBtn(isAuthenticated) {
  const navScheduleBtn = document.getElementById('my-schedule-btn');

  navScheduleBtn.addEventListener('click', () => {
    if (!isAuthenticated) {
      showLoginModal();
      return;
    }
    window.location.href = '/schedule';
    //fetchAndRenderItemsFromDB(username, isAuthenticated);
  });
};

export async function renderSections({ sections, sectionsId }) {
  const sectionWrap = document.querySelector('.section-wrap')
  const addModuleBtnContainer = document.querySelector('.add-module-btn-container')
  sections.forEach((section, index) => {
    const sectionDiv = document.createElement('div')
    const moduleDiv = document.createElement('div')
    const createModuleBtn = document.createElement('div')
    const moduleWrap = document.createElement('div')
    const sectionContainer = document.createElement('div')
    
    const createModuleBtnContainer = document.querySelector('.add-module-btn-container')
    
    sectionDiv.classList.add('section-item')
    moduleDiv.classList.add('module-item')
    createModuleBtn.classList.add('add-module-btn')
    moduleWrap.classList.add('module-wrap')
    sectionContainer.classList.add('section-container')

    sectionDiv.textContent = section
    createModuleBtn.textContent = `add new module for ${section}`
    sectionDiv.dataset.id = sectionsId[index]
    moduleDiv.dataset.id = sectionsId[index]
    createModuleBtn.dataset.id = sectionsId[index]

    sectionContainer.appendChild(sectionDiv)
    sectionContainer.appendChild(moduleWrap) 
    sectionWrap.appendChild(sectionContainer)
    moduleWrap.appendChild(createModuleBtn)
    moduleWrap.appendChild(moduleDiv)
    
  })
}

export function renderPartsBySection({ parts, partsId }) {
  const partsContainer = document.querySelector('.parts-container')
  parts.forEach((part, index) => {
    const partDiv = document.createElement('div')
    partDiv.classList.add('part-item')
    partDiv.textContent = part
    partDiv.dataset.id = partsId[index]
    partsContainer.appendChild(partDiv)
  })
}

export function renderExercisesByPart({ exercises, exercisesId, exercisesImgs }) {
  const exercisesContainer = document.querySelector('.exercises-container')
  exercisesContainer.innerHTML = ''
  exercises.forEach((exercise, index) => {
    const exerciseDiv = document.createElement('div')
    exerciseDiv.classList.add('exercise-item')
    const nameDiv = document.createElement('div')
    nameDiv.textContent = exercise
    exerciseDiv.appendChild(nameDiv)
    const img = document.createElement('img')
    img.src = exercisesImgs[index]
    img.alt = `Image for ${exercise}`
    img.classList.add('exercise-image')
    exerciseDiv.appendChild(img)
    exerciseDiv.dataset.id = exercisesId[index]
    exercisesContainer.appendChild(exerciseDiv)
  })
}

export async function updateLoginButton() {
  const loginButton = document.getElementById('login-register-btn');
  if (loginButton) {
    loginButton.innerText = '登出系統';
    loginButton.id = 'logout-btn';
  }
  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('token');
    hideModals(); // Hide any open modals before reloading
    setTimeout(() => location.reload(), 100); // Delay reload to ensure modals are hidden
  });
}

//export function