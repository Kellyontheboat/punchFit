export function renderSections ({ sections, sectionsId }) {
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

export async function renderExercisesByPart ({ exercises, exercisesId, exercisesImgs, user }) {
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
