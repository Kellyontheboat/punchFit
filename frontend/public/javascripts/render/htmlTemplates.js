import DOMPurify from '/node_modules/dompurify/dist/purify.es.mjs'

export const navHTML = `
    <nav>
    <a href="/" class="homepage-link">
      <span>打卡健身 PunchFit</span>
    </a>
    <span class="nav-item" id="login-register-btn">登入/註冊</span>
    <span class="nav-item" id="my-schedule-btn">我的紀錄</span>

    <!-- Modal: Login -->
    <div id="loginModal" class="modal">
      <div class="modal-content">
        <div class="modal-decorate"></div>
        <div class="modal-title-container">
          <h2>登入會員帳號</h2>
          <span class="close">&times;</span>
        </div>
        <form action="/api/user/auth" method="put" id="signin-form-login" novalidate>
          <div class="form-group">
            <input type="email" id="email" name="email" placeholder="輸入電子信箱" required>
          </div>
          <div class="form-group">
            <input type="password" id="password" name="password" placeholder="輸入密碼" required>
          </div>
          <div class="form-group">
            <button type="submit">登入帳戶</button>
          </div>
        </form>
        <span id="login-msg" class="login-modal-item"></span>
        <span class="login-modal-item" id="register-modal-btn">還沒有帳戶？點此註冊</span>

      </div>
    </div>

  </nav>
`
export const hrHTML = `<hr>`

// export async function injectHTML (selector, html) {
//   const sanitizedHTML = DOMPurify.sanitize(html)
//   document.querySelectorAll(selector).forEach(element => {
//     element.innerHTML = sanitizedHTML
//   })
// }

export function injectHTML(selector, html) {
  return new Promise((resolve) => {
    const sanitizedHTML = DOMPurify.sanitize(html);
    document.querySelectorAll(selector).forEach(element => {
      element.innerHTML = sanitizedHTML;
    });
    console.log('HTML injected.')
    resolve();
  });
}
