export async function renderInviteForm(scheduleId) {
  // Get the container element where the form will be appended
  const container = document.querySelector(`.post[data-id="${scheduleId}"]`);  if (!container) {
    console.error('Container element not found');
    return;
  }

  // Create the form element
  const form = document.createElement('form');
  form.id = 'invite-form';

  // Create hidden input for scheduleId
  const scheduleInput = document.createElement('input');
  scheduleInput.type = 'hidden';
  scheduleInput.name = 'scheduleId';
  scheduleInput.value = scheduleId;
  form.appendChild(scheduleInput);

  // Create input for coachId
  const coachInput = document.createElement('input');
  coachInput.type = 'email';
  coachInput.name = 'coachEmail';
  coachInput.placeholder = 'Coach Email';
  coachInput.required = true;
  form.appendChild(coachInput);

  // Create submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Consult Coach';
  form.appendChild(submitButton);

  // Append the form to the container
  //container.appendChild(form);
  container.insertAdjacentElement('afterend', form)
}


