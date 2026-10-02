/**
 * SCRUM-114: [FE] S5-35 - UI Form Đổi mật khẩu
 * Client-side validation & Interactive Logic
 * TTCS CRM Enterprise Frontend
 */

(function () {
  'use strict';

  // State
  const state = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    revokeOtherSessions: true,
    touched: {
      currentPassword: false,
      newPassword: false,
      confirmPassword: false
    },
    mockMode: 'AUTO', // AUTO, FORCE_SUCCESS, FORCE_WRONG_CURRENT, FORCE_SAME_AS_OLD, FORCE_SERVER_ERROR
    isSubmitting: false
  };

  const DEFAULT_MOCK_CURRENT = 'OldPassword123@';

  // DOM Elements
  const form = document.getElementById('changePasswordForm');
  const currentPasswordInput = document.getElementById('currentPassword');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const revokeOtherSessionsInput = document.getElementById('revokeOtherSessions');
  const submitBtn = document.getElementById('submitBtn');
  const resetBtn = document.getElementById('resetBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  // Error containers
  const currentPasswordError = document.getElementById('currentPasswordError');
  const newPasswordError = document.getElementById('newPasswordError');
  const confirmPasswordError = document.getElementById('confirmPasswordError');
  const confirmPasswordSuccess = document.getElementById('confirmPasswordSuccess');

  // Strength meter elements
  const strengthMeterBox = document.getElementById('strengthMeterBox');
  const strengthStatus = document.getElementById('strengthStatus');
  const strengthBarFill = document.getElementById('strengthBarFill');
  const critMinLength = document.getElementById('critMinLength');
  const critHasLetter = document.getElementById('critHasLetter');
  const critHasNumber = document.getElementById('critHasNumber');

  // Alert banner & Toast container
  const formAlertContainer = document.getElementById('formAlertContainer');
  const toastContainer = document.getElementById('toastContainer');

  // Toggle buttons
  const toggleCurrentPwdBtn = document.getElementById('toggleCurrentPwdBtn');
  const toggleNewPwdBtn = document.getElementById('toggleNewPwdBtn');
  const toggleConfirmPwdBtn = document.getElementById('toggleConfirmPwdBtn');

  // Dev toolbar buttons
  const fillValidBtn = document.getElementById('fillValidBtn');
  const fillInvalidBtn = document.getElementById('fillInvalidBtn');
  const mockModeBtns = document.querySelectorAll('.test-mode-btn');

  // Eye Icons SVG templates
  const EYE_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  const EYE_OFF_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

  // Checklist Icons SVG templates
  const CHECK_ICON = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
  const CROSS_ICON = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  // Helper: Toast notification
  function showToast(title, message, type = 'success') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconSvg = type === 'success'
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button type="button" class="toast-close" aria-label="Đóng">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      setTimeout(() => toast.remove(), 200);
    });

    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        setTimeout(() => toast.remove(), 200);
      }
    }, 4500);
  }

  // Helper: Banner Alert
  function showAlertBanner(title, message, type = 'error') {
    if (!formAlertContainer) return;
    const iconSvg = type === 'success'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

    formAlertContainer.innerHTML = `
      <div class="alert alert-${type}">
        <div style="flex-shrink: 0; margin-top: 1px;">${iconSvg}</div>
        <div>
          <strong>${title}</strong>
          <p style="margin-top: 2px; opacity: 0.9;">${message}</p>
        </div>
      </div>
    `;
    formAlertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearAlertBanner() {
    if (formAlertContainer) {
      formAlertContainer.innerHTML = '';
    }
  }

  // Toggle password visibility
  function setupToggleVisibility(btn, input) {
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      const isPassword = input.getAttribute('type') === 'password';
      input.setAttribute('type', isPassword ? 'text' : 'password');
      btn.innerHTML = isPassword ? EYE_OFF_ICON : EYE_ICON;
      btn.setAttribute('aria-label', isPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
    });
  }

  setupToggleVisibility(toggleCurrentPwdBtn, currentPasswordInput);
  setupToggleVisibility(toggleNewPwdBtn, newPasswordInput);
  setupToggleVisibility(toggleConfirmPwdBtn, confirmPasswordInput);

  // Validation functions
  function validateCurrentPassword(val) {
    if (!val || !val.trim()) {
      return 'Vui lòng nhập mật khẩu hiện tại';
    }
    return '';
  }

  function validateNewPassword(val, currentPwd) {
    if (!val) {
      return 'Vui lòng nhập mật khẩu mới';
    }
    if (val.length < 8) {
      return 'Mật khẩu mới phải có tối thiểu 8 ký tự';
    }
    if (!/[a-zA-Z]/.test(val)) {
      return 'Mật khẩu mới phải chứa ít nhất 1 chữ cái';
    }
    if (!/[0-9]/.test(val)) {
      return 'Mật khẩu mới phải chứa ít nhất 1 chữ số';
    }
    if (currentPwd && val === currentPwd) {
      return 'Mật khẩu mới không được trùng với mật khẩu hiện tại';
    }
    return '';
  }

  function validateConfirmPassword(val, newPwd) {
    if (!val) {
      return 'Vui lòng xác nhận mật khẩu mới';
    }
    if (val !== newPwd) {
      return 'Mật khẩu xác nhận không khớp với mật khẩu mới';
    }
    return '';
  }

  // Password Strength Calculator
  function calculateStrength(pwd) {
    if (!pwd) {
      return { score: 0, label: 'Chưa nhập', colorClass: '', percent: '0%' };
    }

    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

    if (score <= 2) {
      return { score: 1, label: 'Yếu', colorClass: 'weak', percent: '25%' };
    } else if (score === 3) {
      return { score: 2, label: 'Trung bình', colorClass: 'medium', percent: '50%' };
    } else if (score === 4) {
      return { score: 3, label: 'Mạnh', colorClass: 'strong', percent: '75%' };
    } else {
      return { score: 4, label: 'Rất mạnh', colorClass: 'very-strong', percent: '100%' };
    }
  }

  // Update UI Elements
  function updateUI() {
    const curVal = currentPasswordInput.value;
    const newVal = newPasswordInput.value;
    const conVal = confirmPasswordInput.value;

    const curErr = validateCurrentPassword(curVal);
    const newErr = validateNewPassword(newVal, curVal);
    const conErr = validateConfirmPassword(conVal, newVal);

    // Current Password UI
    if (state.touched.currentPassword && curErr) {
      currentPasswordInput.classList.add('is-invalid');
      currentPasswordInput.classList.remove('is-valid');
      currentPasswordError.style.display = 'flex';
      currentPasswordError.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${curErr}`;
    } else {
      currentPasswordInput.classList.remove('is-invalid');
      currentPasswordError.style.display = 'none';
      if (curVal) currentPasswordInput.classList.add('is-valid');
      else currentPasswordInput.classList.remove('is-valid');
    }

    // New Password UI & Strength
    if (newVal) {
      strengthMeterBox.style.display = 'block';
      const strength = calculateStrength(newVal);
      strengthStatus.textContent = strength.label;
      strengthBarFill.className = `strength-bar-fill ${strength.colorClass}`;

      // Criteria Breakdown
      const hasMinLength = newVal.length >= 8;
      const hasLetter = /[a-zA-Z]/.test(newVal);
      const hasNumber = /[0-9]/.test(newVal);

      critMinLength.className = `criteria-item ${hasMinLength ? 'met' : ''}`;
      critMinLength.innerHTML = `${hasMinLength ? CHECK_ICON : CROSS_ICON} Tối thiểu 8 ký tự`;

      critHasLetter.className = `criteria-item ${hasLetter ? 'met' : ''}`;
      critHasLetter.innerHTML = `${hasLetter ? CHECK_ICON : CROSS_ICON} Có ít nhất 1 chữ cái`;

      critHasNumber.className = `criteria-item ${hasNumber ? 'met' : ''}`;
      critHasNumber.innerHTML = `${hasNumber ? CHECK_ICON : CROSS_ICON} Có ít nhất 1 chữ số`;
    } else {
      strengthMeterBox.style.display = 'none';
    }

    if (state.touched.newPassword && newErr) {
      newPasswordInput.classList.add('is-invalid');
      newPasswordInput.classList.remove('is-valid');
      newPasswordError.style.display = 'flex';
      newPasswordError.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${newErr}`;
    } else {
      newPasswordInput.classList.remove('is-invalid');
      newPasswordError.style.display = 'none';
      if (newVal && !newErr) newPasswordInput.classList.add('is-valid');
      else newPasswordInput.classList.remove('is-valid');
    }

    // Confirm Password UI
    if (state.touched.confirmPassword && conErr) {
      confirmPasswordInput.classList.add('is-invalid');
      confirmPasswordInput.classList.remove('is-valid');
      confirmPasswordError.style.display = 'flex';
      confirmPasswordError.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${conErr}`;
      confirmPasswordSuccess.style.display = 'none';
    } else {
      confirmPasswordInput.classList.remove('is-invalid');
      confirmPasswordError.style.display = 'none';
      if (conVal && !conErr && newVal === conVal) {
        confirmPasswordInput.classList.add('is-valid');
        confirmPasswordSuccess.style.display = 'flex';
      } else {
        confirmPasswordInput.classList.remove('is-valid');
        confirmPasswordSuccess.style.display = 'none';
      }
    }
  }

  // Event Listeners for inputs
  [currentPasswordInput, newPasswordInput, confirmPasswordInput].forEach((input) => {
    input.addEventListener('input', () => {
      clearAlertBanner();
      updateUI();
    });

    input.addEventListener('blur', (e) => {
      const fieldId = e.target.id;
      if (state.touched[fieldId] !== undefined) {
        state.touched[fieldId] = true;
      }
      updateUI();
    });
  });

  // Reset form
  function handleReset() {
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
    revokeOtherSessionsInput.checked = true;

    state.touched.currentPassword = false;
    state.touched.newPassword = false;
    state.touched.confirmPassword = false;

    clearAlertBanner();
    updateUI();
    showToast('Đã làm lại', 'Đã xóa toàn bộ thông tin nhập trên form', 'info');
  }

  if (resetBtn) resetBtn.addEventListener('click', handleReset);
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn hủy bỏ thao tác đổi mật khẩu?')) {
        handleReset();
      }
    });
  }

  // Dev Toolbar: Quick fill
  if (fillValidBtn) {
    fillValidBtn.addEventListener('click', () => {
      currentPasswordInput.value = DEFAULT_MOCK_CURRENT;
      newPasswordInput.value = 'NewPassword2026@';
      confirmPasswordInput.value = 'NewPassword2026@';
      state.touched.currentPassword = true;
      state.touched.newPassword = true;
      state.touched.confirmPassword = true;
      clearAlertBanner();
      updateUI();
      showToast('Đã điền mẫu hợp lệ', 'Mật khẩu cũ: OldPassword123@, Mật khẩu mới: NewPassword2026@', 'success');
    });
  }

  if (fillInvalidBtn) {
    fillInvalidBtn.addEventListener('click', () => {
      currentPasswordInput.value = '123';
      newPasswordInput.value = 'short';
      confirmPasswordInput.value = 'mismatch';
      state.touched.currentPassword = true;
      state.touched.newPassword = true;
      state.touched.confirmPassword = true;
      clearAlertBanner();
      updateUI();
      showToast('Đã điền mẫu dữ liệu lỗi', 'Kiểm tra thông báo validate hiển thị bên dưới các trường', 'error');
    });
  }

  // Mock Mode Switcher
  mockModeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      mockModeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.mockMode = btn.getAttribute('data-mode');
      showToast('Chế độ Mock API', `Đã chuyển sang: ${btn.textContent.trim()}`, 'info');
    });
  });

  // Form Submit Handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAlertBanner();

    // Mark all as touched
    state.touched.currentPassword = true;
    state.touched.newPassword = true;
    state.touched.confirmPassword = true;
    updateUI();

    const curVal = currentPasswordInput.value;
    const newVal = newPasswordInput.value;
    const conVal = confirmPasswordInput.value;

    const curErr = validateCurrentPassword(curVal);
    const newErr = validateNewPassword(newVal, curVal);
    const conErr = validateConfirmPassword(conVal, newVal);

    if (curErr || newErr || conErr) {
      if (curErr) currentPasswordInput.focus();
      else if (newErr) newPasswordInput.focus();
      else if (conErr) confirmPasswordInput.focus();

      showAlertBanner('Dữ liệu chưa hợp lệ', 'Vui lòng kiểm tra và sửa các lỗi hiển thị phía trên trước khi tiếp tục.');
      return;
    }

    // Start submission state
    state.isSubmitting = true;
    submitBtn.disabled = true;
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
      <span>Đang xử lý đổi mật khẩu...</span>
    `;

    // Simulated Server Latency
    setTimeout(() => {
      state.isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;

      const mode = state.mockMode;

      // Handle Mock modes
      if (mode === 'FORCE_SERVER_ERROR') {
        showAlertBanner('Lỗi 500 (Máy chủ)', 'Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại sau ít phút.');
        showToast('Lỗi máy chủ', 'Hệ thống đang bảo trì hoặc mất kết nối mạng', 'error');
        return;
      }

      if (mode === 'FORCE_WRONG_CURRENT' || (mode === 'AUTO' && curVal !== DEFAULT_MOCK_CURRENT)) {
        currentPasswordInput.classList.add('is-invalid');
        currentPasswordError.style.display = 'flex';
        currentPasswordError.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Mật khẩu hiện tại không chính xác`;
        currentPasswordInput.focus();
        showAlertBanner('Đổi mật khẩu thất bại', 'Mật khẩu hiện tại không chính xác. Mật khẩu mẫu mặc định là: ' + DEFAULT_MOCK_CURRENT);
        showToast('Xác thực thất bại', 'Mật khẩu hiện tại không đúng', 'error');
        return;
      }

      if (mode === 'FORCE_SAME_AS_OLD') {
        newPasswordInput.classList.add('is-invalid');
        newPasswordError.style.display = 'flex';
        newPasswordError.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Mật khẩu mới không được trùng với mật khẩu cũ`;
        newPasswordInput.focus();
        showAlertBanner('Đổi mật khẩu thất bại', 'Mật khẩu mới không được trùng với mật khẩu hiện tại.');
        showToast('Lỗi mật khẩu', 'Mật khẩu mới trùng mật khẩu cũ', 'error');
        return;
      }

      // Success Scenario (200 OK)
      const isRevoking = revokeOtherSessionsInput.checked;
      let successMsg = 'Mật khẩu của bạn đã được cập nhật thành công!';
      if (isRevoking) {
        successMsg += ' Tất cả các phiên đăng nhập khác trên thiết bị di động và máy tính khác đã bị thu hồi an toàn.';
      }

      showAlertBanner('Thành công', successMsg, 'success');
      showToast('Đổi mật khẩu thành công', successMsg, 'success');

      // Clear sensitive fields
      currentPasswordInput.value = '';
      newPasswordInput.value = '';
      confirmPasswordInput.value = '';
      state.touched.currentPassword = false;
      state.touched.newPassword = false;
      state.touched.confirmPassword = false;
      updateUI();
    }, 700);
  });

})();
