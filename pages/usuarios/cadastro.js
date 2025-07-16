document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("cadastroForm")
    const errorMessage = document.getElementById("errorMessage")
    const cadastroButton = document.getElementById("cadastroButton")
    const cadastroButtonText = document.getElementById("cadastroButtonText")
    const cadastroButtonLoading = document.getElementById("cadastroButtonLoading")
  
    const checkDependencies = () => {
      if (window.Utils && window.API_CONFIG && window.AuthUtils) {
        initForm()
      } else {
        setTimeout(checkDependencies, 100)
      }
    }
    checkDependencies()
  
    async function initForm() {
      if (window.AuthUtils && (await window.AuthUtils.isLoggedIn())) {
        window.location.href = "/pages/dashboard/dashboard.html"
        return
      }
  
      form.addEventListener("submit", handleSubmit)
    }
  
    async function handleSubmit(e) {
      e.preventDefault()
  
      if (!validateForm()) {
        return
      }
  
      showLoading(true)
  
      try {
        const formData = {
          nome: document.getElementById("nome").value.trim(),
          email: document.getElementById("email").value.trim(),
          senha: document.getElementById("senha").value,
          ativo: true,
        }
  
        const response = await window.API_CONFIG.authenticatedRequest(window.API_CONFIG.ENDPOINTS.USUARIOS, {
          method: "POST",
          body: JSON.stringify(formData),
        })
  
        showToast("Conta criada com sucesso! Faça login para continuar.", "success")
        form.reset()
        hideError()
  
        setTimeout(() => {
          window.location.href = "/pages/auth/login.html"
        }, 2000)
      } catch (error) {
        console.error("Erro ao criar conta:", error)
  
        let errorMsg = "Erro ao criar conta. Tente novamente."
  
        if (error.response) {
          const errorData = await error.response.json().catch(() => ({}))
          if (errorData.message) {
            errorMsg = errorData.message
          } else if (errorData.errors) {
            const firstError = Object.values(errorData.errors)[0]
            errorMsg = Array.isArray(firstError) ? firstError[0] : firstError
          }
        } else if (error.message) {
          errorMsg = error.message
        }
  
        showError(errorMsg)
      } finally {
        showLoading(false)
      }
    }
  
    function validateForm() {
      const nomeInput = document.getElementById("nome")
      const emailInput = document.getElementById("email")
      const senhaInput = document.getElementById("senha")
      const confirmarSenhaInput = document.getElementById("confirmarSenha")
  
      if (!nomeInput || !emailInput || !senhaInput || !confirmarSenhaInput) {
        showError("Erro interno: campo do formulário não encontrado.")
        return false
      }
  
      const nome = nomeInput.value.trim()
      const email = emailInput.value.trim()
      const senha = senhaInput.value
      const confirmarSenha = confirmarSenhaInput.value
  
      if (!nome) {
        showError("Nome é obrigatório")
        return false
      }
  
      if (nome.length < 3) {
        showError("Nome deve ter pelo menos 3 caracteres")
        return false
      }
  
      if (!email) {
        showError("Email é obrigatório")
        return false
      }
  
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        showError("Email inválido")
        return false
      }
  
      if (!senha) {
        showError("Senha é obrigatória")
        return false
      }
  
      if (senha.length < 6) {
        showError("Senha deve ter pelo menos 6 caracteres")
        return false
      }
  
      if (senha !== confirmarSenha) {
        showError("Senhas não coincidem")
        return false
      }
  
      hideError()
      return true
    }
  
    function showError(message) {
      errorMessage.textContent = message
      errorMessage.classList.remove("hidden")
      errorMessage.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  
    function hideError() {
      errorMessage.classList.add("hidden")
    }
  
    function showLoading(show) {
      if (show) {
        cadastroButtonText.classList.add("hidden")
        cadastroButtonLoading.classList.remove("hidden")
        cadastroButton.disabled = true
      } else {
        cadastroButtonText.classList.remove("hidden")
        cadastroButtonLoading.classList.add("hidden")
        cadastroButton.disabled = false
      }
    }
  
        function showToast(message, type = "info") {
      if (window.Utils && window.Utils.showToast) {
        window.Utils.showToast(message, type)
        return
      }
      
      const toastCounter = window.toastCounter || 0
      window.toastCounter = toastCounter + 1
      
      const toast = document.createElement("div")
      const topPosition = 24 + (toastCounter) * 80
      toast.className = `fixed right-4 z-50 p-4 rounded-xl shadow-2xl transition-all duration-300 transform translate-x-full backdrop-blur-lg`
      toast.style.top = `${topPosition}px`

      const colors = {
        success: "bg-green-500/90 text-white",
        error: "bg-red-500/90 text-white",
        warning: "bg-yellow-500/90 text-black",
        info: "bg-blue-500/90 text-white",
      }

      const icons = {
        success: "fas fa-check-circle",
        error: "fas fa-exclamation-circle",
        warning: "fas fa-exclamation-triangle",
        info: "fas fa-info-circle",
      }

      toast.className += ` ${colors[type] || colors.info}`
      toast.innerHTML = `
              <div class="flex items-center space-x-2">
                  <i class="${icons[type] || icons.info}"></i>
                  <span>${message}</span>
              </div>
          `

      document.body.appendChild(toast)
      setTimeout(() => toast.classList.remove("translate-x-full"), 100)
      setTimeout(() => {
        toast.classList.add("translate-x-full")
        setTimeout(() => {
          toast.remove()
          window.toastCounter = Math.max(0, (window.toastCounter || 1) - 1)
        }, 300)
      }, 3000)
    }
  
    const inputs = form.querySelectorAll("input")
    inputs.forEach((input) => {
      input.addEventListener("blur", () => {
        if (input.value.trim()) {
          validateForm()
        }
      })
  
      input.addEventListener("input", () => {
        if (!errorMessage.classList.contains("hidden")) {
          hideError()
        }
      })
    })
  })
  