import { getModules, getModuleBySection, getExerciseInModule } from '../api/moduleScript.js'


export async function showLoginModal () {
  const loginModal = document.getElementById('loginPopup')
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
async function closeButtons () {
  const loginModal = document.getElementById('loginPopup')
  const closeButtons = document.querySelectorAll('.close')
  closeButtons.forEach(btn => {
    btn.addEventListener('click', function (event) {
      console.log(event.target)
      loginModal.style.display = 'none'
      // registerModal.style.display = 'none';
    })
  })
}

export function navScheduleBtn (isAuthenticated) {
  const navScheduleBtn = document.getElementById('my-schedule-btn')

  navScheduleBtn.addEventListener('click', () => {
    if (!isAuthenticated) {
      showLoginModal()
      return
    }
    window.location.href = '/schedule'
  })
};

export async function renderSections ({ sections, sectionsId }) {
  const sectionWrap = document.querySelector('.section-wrap')
  const addModuleBtnContainer = document.querySelector('.add-module-btn-container')
  sections.forEach((section, index) => {
    const sectionDiv = document.createElement('div')
    const moduleDiv = document.createElement('div')
    const createModuleBtn = document.createElement('div')
    const moduleWrap = document.createElement('div')
    const sectionContainer = document.createElement('div')

    sectionDiv.classList.add('section-item')
    moduleDiv.classList.add('module-item')
    createModuleBtn.classList.add('add-module-btn')
    moduleWrap.classList.add('module-wrap')
    sectionContainer.classList.add('section-container')

    sectionDiv.textContent = section
    createModuleBtn.textContent = `Create new memo for ${section}`
    sectionDiv.dataset.id = sectionsId[index]
    moduleDiv.dataset.sectionId = sectionsId[index]
    createModuleBtn.dataset.id = sectionsId[index]

    sectionContainer.appendChild(sectionDiv)
    sectionContainer.appendChild(moduleWrap)
    sectionWrap.appendChild(sectionContainer)
    moduleWrap.appendChild(createModuleBtn)
    moduleWrap.appendChild(moduleDiv)
  })
}

export function renderPartsBySection ({ parts, partsId }) {
  const partsContainer = document.querySelector('.parts-container')
  parts.forEach((part, index) => {
    const partDiv = document.createElement('div')
    partDiv.classList.add('part-item')
    partDiv.textContent = part
    partDiv.dataset.id = partsId[index]
    partsContainer.appendChild(partDiv)
  })
}

export async function renderExercisesByPart({ exercises, exercisesId, exercisesImgs, user }) {
  const exercisesContainer = document.querySelector('.exercises-container')
  exercisesContainer.innerHTML = ''

  // Create a container div with Bootstrap's row and gutter classes
  const rowDiv = document.createElement('div')
  rowDiv.classList.add('row', 'g-3')

  exercises.forEach((exercise, index) => {
    // Create a Bootstrap column for each exercise card
    const colDiv = document.createElement('div')
    colDiv.classList.add('col-md-4', 'col-sm-6')
    colDiv.style = 'width: 20rem;' // can control card distance
    // Create the Bootstrap card
    const cardDiv = document.createElement('div')
    cardDiv.classList.add('card')
    cardDiv.style.width = '18rem' // adjust card width
    cardDiv.dataset.id = exercisesId[index]

    // Add image to the card
    const img = document.createElement('img')
    img.src = exercisesImgs[index]
    img.alt = `Image for ${exercise}`
    img.classList.add('card-img-top')
    cardDiv.appendChild(img)

    // Add card body
    const cardBodyDiv = document.createElement('div')
    cardBodyDiv.classList.add('card-body')

    // Add exercise name as the card title
    const titleH4 = document.createElement('h4')
    titleH4.classList.add('card-title')
    titleH4.textContent = exercise
    cardBodyDiv.appendChild(titleH4)

    // Add a placeholder card text
    const cardTextP = document.createElement('p')
    cardTextP.classList.add('card-text')
    cardTextP.textContent = 'Click to see more details or add this exercise into the Memo.'
    cardBodyDiv.appendChild(cardTextP)

    // button to trigger detail modal
    const exerciseDetailBtn = document.createElement('a')
    exerciseDetailBtn.classList.add('btn', 'btn-primary', 'exercise-detail')
    exerciseDetailBtn.textContent = 'detail'
    exerciseDetailBtn.setAttribute('data-bs-toggle', 'modal')
    exerciseDetailBtn.setAttribute('data-bs-target', '#exerciseModal')
    cardBodyDiv.appendChild(exerciseDetailBtn)

    // button to add new exercise to the module
    if (user) {
      const btn = document.createElement('a')
      btn.classList.add('btn', 'btn-primary', 'add-into-memo')
      btn.textContent = '+'
      btn.setAttribute('data-bs-toggle', 'modal')
      btn.setAttribute('data-bs-target', '#exerciseModal')
      cardBodyDiv.appendChild(btn)

    }
    
    cardDiv.appendChild(cardBodyDiv)
    colDiv.appendChild(cardDiv)
    rowDiv.appendChild(colDiv)
  })

  // Append the row to the container
  exercisesContainer.appendChild(rowDiv)
}

export async function updateLoginButton () {
  const loginButton = document.getElementById('login-register-btn')
  if (loginButton) {
    loginButton.innerText = '登出系統'
    loginButton.id = 'logout-btn'
  }
  const logoutBtn = document.getElementById('logout-btn')
  logoutBtn.addEventListener('click', (event) => {
    event.preventDefault()
    localStorage.removeItem('token')
    hideModals() // Hide any open modals before reloading
    setTimeout(() => location.reload(), 100) // Delay reload to ensure modals are hidden
  })
}

function hideModals() {
  loginModal.style.display = 'none';
  registerModal.style.display = 'none';
}

// render all modules has been created by a user in index page
export async function renderModules (user, isAuthenticated) {
  console.log(user)
  if (!user) {
    return
  }

  try {
    const modules = await getModules(user, isAuthenticated)
    console.log('renderModules', modules)

    if (!modules) {
      console.error('Modules is undefined:', modules)
      return
    }

    //render each module in modules which has already been created
    modules.forEach(module => {
      const sectionId = module.section_id
      const moduleId = module.id
      // specify the moduleWrap of the module by sectionId in this loop
      const moduleWrap = document.querySelector(`.section-item[data-id="${sectionId}"]`)
        .closest('.section-container')
        .querySelector('.module-wrap')

      if (moduleWrap) {
        const moduleSpace = moduleWrap.querySelector('.module-item')
        if (moduleSpace) {
          const dataId = moduleSpace.dataset.id
          // render module is created 
          moduleSpace.style.backgroundColor = '#f7d352'
          console.log(moduleSpace)
          moduleSpace.style.color = '#bf3b3b'
          moduleSpace.dataset.id = moduleId
          moduleSpace.dataset.sectionId = sectionId
          const closestSection = document.querySelector(`.section-item[data-id="${sectionId}"]`).textContent
          moduleSpace.innerText = `${closestSection} Template has been created!
          Click to edit/create exercises inside.`
          moduleSpace.dataset.sectionName = closestSection
        }
      } else {
        console.warn(`No module-wrap found for sectionId ${sectionId}`)
      }
    })
  } catch (error) {
    console.error('Error in renderModules:', error)
  }
}

export async function renderEditModule (user) {
  if(!user) return

  const { modules } = await getModuleBySection(user) // modules[index].section_id/module_name/member_id
  if (modules.length === 0) {return}
  //! temp for one module in a section
  const module = modules[0]
  console.log(modules)
  const moduleName = module.module_name
  const moduleId = module.id
  console.log(moduleId)
  const moduleDiv = document.createElement('div')
  moduleDiv.classList.add('module-editing')
  moduleDiv.dataset.id = moduleId
  moduleDiv.innerText = `Let's select exercises into ${moduleName} memo!`

  const navElement = document.querySelector('nav')
  navElement.insertAdjacentElement('afterend', moduleDiv)
}

export async function renderItemsInModule(itemContainers) {
  console.log(itemContainers)
  for (const container of itemContainers) {
    console.log(container);
    const moduleId = container.dataset.id;
    if (!moduleId) continue

    const items = await getExerciseInModule(moduleId);

    // Clear the container before rendering items
    if (items.length !== 0){
      container.innerText = '';
    }

    items.forEach(item => {
      const itemDiv = document.createElement('div');
      const detailDiv = document.createElement('div');

      const exerciseName = item.exercise.name;
      const exerciseId = item.exercise_id;
      const { reps, sets, weight } = item;

      itemDiv.classList.add('exercise-item');
      itemDiv.dataset.id = exerciseId;

      detailDiv.classList.add('exercise-item-detail');
      detailDiv.innerText = `*${exerciseName} ${reps} reps ${sets} sets ${weight} kg`;

      container.appendChild(itemDiv);
      itemDiv.appendChild(detailDiv);
    });
  }
}
