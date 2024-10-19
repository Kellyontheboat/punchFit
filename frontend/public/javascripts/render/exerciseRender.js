import { submitSectionForm } from '../api/exerciseScript.js'
import { showLoginModal } from './navRender.js'

export async function addTrainingRecordBtn (isAuthenticated) {
  const welcomeContainer = document.querySelector('.welcome')
  welcomeContainer.innerText = ''
  welcomeContainer.classList.add('btn')
  const scrollSectionImgBtn = document.createElement('div')
  const trainingButton = document.createElement('button')

  trainingButton.innerText = 'Let\'s Add Training Record For Today'
  if (isAuthenticated) {
    scrollSectionImgBtn.innerText = 'Or click below to edit your modules:'
  } else {
    scrollSectionImgBtn.innerText = 'Click below to check out our exercise library:'
  }

  trainingButton.classList.add('btn', 'btn-primary')

  scrollSectionImgBtn.classList.add('scroll-to-section')

  trainingButton.addEventListener('click', function () {
    if (!isAuthenticated) {
      showLoginModal()
      return
    }
    window.location.href = '/training'
  })
  welcomeContainer.appendChild(trainingButton)
  welcomeContainer.appendChild(scrollSectionImgBtn)
}

export async function renderSections ({ sections, sectionsId }) {
  const sectionWrap = document.querySelector('.section-wrap')
  const addModuleBtnContainer = document.querySelector('.add-module-btn-container')
  sections.forEach((section, index) => {
    const sectionDiv = document.createElement('div')
    const moduleDiv = document.createElement('div')
    const moduleWrap = document.createElement('div')
    const sectionContainer = document.createElement('div')

    sectionDiv.classList.add('section-item')
    moduleDiv.classList.add('module-item')
    moduleWrap.classList.add('module-wrap')
    sectionContainer.classList.add('section-container')

    sectionDiv.textContent = section

    sectionDiv.dataset.id = sectionsId[index]
    moduleDiv.dataset.sectionId = sectionsId[index]

    sectionContainer.appendChild(sectionDiv)
    sectionContainer.appendChild(moduleWrap)
    sectionWrap.appendChild(sectionContainer)
    moduleWrap.appendChild(moduleDiv)
  })
}

export function sectionCheckBox () {
  document.querySelectorAll('.section-card').forEach(card => {
    card.addEventListener('click', function () {
      const checkbox = card.querySelector('.section-checkbox')
      if (checkbox) {
        checkbox.checked = !checkbox.checked // Toggle the checkbox state

        // Trigger change event manually
        checkbox.dispatchEvent(new Event('change'))
      }
    })
  })

  const checkboxes = document.querySelectorAll('.section-checkbox')
  const startButtonContainer = document.getElementById('startButtonContainer')
  const form = document.getElementById('sectionForm')

  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function () {
      if (Array.from(checkboxes).some(checkbox => checkbox.checked)) {
        startButtonContainer.classList.remove('d-none')
      } else {
        startButtonContainer.classList.add('d-none')
      }
    })
  })

  submitSectionForm(form, checkboxes)
}

export function renderPartsBySection ({ parts, partsId }) {
  const partsContainer = document.querySelector('.parts-container')

  parts.forEach((part, index) => {
    const partDiv = document.createElement('button')
    partDiv.type = 'button'
    partDiv.className = 'btn btn-outline-warning'
    partDiv.classList.add('part-item')
    partDiv.textContent = part
    partDiv.dataset.id = partsId[index]
    partsContainer.appendChild(partDiv)
  })
}

export async function renderExercisesByPart ({ data, exercises, exercisesId, exercisesImgs, user }) {
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
    cardDiv.classList.add('card', 'exercise')
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

    // // Add a placeholder card text
    // const cardTextP = document.createElement('p')
    // cardTextP.classList.add('card-text')
    // cardTextP.textContent = 'Click to see more details or add this exercise into the Memo.'
    // cardBodyDiv.appendChild(cardTextP)

    // button to trigger detail modal
    const exerciseDetailBtn = document.createElement('a')
    exerciseDetailBtn.classList.add('btn', 'btn-primary', 'exercise-detail')
    exerciseDetailBtn.textContent = 'detail'
    exerciseDetailBtn.setAttribute('data-bs-toggle', 'modal')
    exerciseDetailBtn.setAttribute('data-bs-target', '#exerciseModal')
    exerciseDetailBtn.dataset.id = exercisesId[index]
    cardBodyDiv.appendChild(exerciseDetailBtn)

    // button to add new exercise to the module
    if (user) {
      const btn = document.createElement('a')
      btn.classList.add('btn', 'btn-primary', 'add-into-memo')
      btn.textContent = '+'
      cardBodyDiv.appendChild(btn)
    }

    cardDiv.appendChild(cardBodyDiv)
    colDiv.appendChild(cardDiv)
    rowDiv.appendChild(colDiv)
  })

  // Append the row to the container
  exercisesContainer.appendChild(rowDiv)
}

export async function exerciseCardModal (data) {

  const exerciseCardModal = document.querySelector('#exerciseModal')

  const modalTitle = exerciseCardModal.querySelector('.modal-title')
  modalTitle.innerText = data.name

  // Clear the existing content in the modal body
  const modalBody = exerciseCardModal.querySelector('.modal-body')
  modalBody.innerHTML = ''

  // Create elements for the modal body content
  const forceParagraph = document.createElement('div')
  forceParagraph.innerText = `Force: ${data.force}`

  const levelParagraph = document.createElement('div')
  levelParagraph.innerText = `Level: ${data.level}`

  const mechanicParagraph = document.createElement('div')
  mechanicParagraph.innerText = `Mechanic: ${data.mechanic}`

  const equipmentParagraph = document.createElement('div')
  equipmentParagraph.innerText = `Equipment: ${data.equipment}`

  const categoryParagraph = document.createElement('div')
  categoryParagraph.innerText = `Category: ${data.category}`

  // Create a div for images
  const imagesDiv = document.createElement('div')
  imagesDiv.classList.add('exercise-images')

  // Loop through images and create img elements
  data.images.forEach(url => {
    const imgElement = document.createElement('img')
    imgElement.src = url
    imgElement.alt = data.name
    imgElement.classList.add('img-fluid', 'mb-2') // Add Bootstrap classes for styling
    imagesDiv.appendChild(imgElement)
  })

  // Append all created elements to the modal body
  modalBody.appendChild(forceParagraph)
  modalBody.appendChild(levelParagraph)
  modalBody.appendChild(mechanicParagraph)
  modalBody.appendChild(equipmentParagraph)
  modalBody.appendChild(categoryParagraph)
  modalBody.appendChild(imagesDiv)

  // Show the modal
  const modalInstance = bootstrap.Modal.getOrCreateInstance(exerciseCardModal)
  modalInstance.show()
}

export function partContainerStickOnTop () {
  window.addEventListener('scroll', function () {
    const partsContainer = document.querySelector('.parts-container')
    const scrollTop = window.scrollY

    if (scrollTop > 0) {
      partsContainer.style.top = '0px'
    } else {
      partsContainer.style.top = '60px' // Reset to original value when at the top
    }
  })
}
