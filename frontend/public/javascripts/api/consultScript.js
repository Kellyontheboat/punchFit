import { renderInviteForm } from '../render/consultRender.js'
const token = localStorage.getItem('token')

export async function addListenerConsultBtn() {
  const consultBtn = document.querySelector('.consult');

  consultBtn.addEventListener('click', async (event) => {
    const scheduleId = event.currentTarget.dataset.id;
    const inviteForm = document.getElementById('invite-form');

    if (consultBtn.innerText === 'Consult Coach') {
      consultBtn.innerText = 'Cancel';
      await renderInviteForm(scheduleId);
      submitInviteForm();
    } else {
      consultBtn.innerText = 'Consult Coach';
      if (inviteForm) {
        inviteForm.remove();
      }
    }
  });
}


export async function submitInviteForm() {
  document.getElementById('invite-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
      scheduleId: formData.get('scheduleId'),
      coachEmail: formData.get('coachEmail'),
    };
    console.log(data)
    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log('Invitation sent:', result);
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  })
}