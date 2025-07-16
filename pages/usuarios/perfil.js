window.addEventListener("DOMContentLoaded", () => {
  if (window.initAuthGuard) window.initAuthGuard();
  const initAuthGuard = () => {
  }
  const AuthUtils = {
    getCurrentUser: () => {
    },
    saveUser: (user) => {
    },
  }
  const API_CONFIG = {
    authenticatedRequest: async (url, options) => {
    },
  }

  let usuarioOriginal = null
  let modoEdicao = false

  const profileInitials = document.getElementById("profileInitials")
  const profileName = document.getElementById("profileName")
  const profileEmail = document.getElementById("profileEmail")

  const nameInput = document.getElementById("nameInput")
  const emailInput = document.getElementById("emailInput")
  const newPasswordInput = document.getElementById("newPasswordInput")
  const confirmPasswordInput = document.getElementById("confirmPasswordInput")
  const allInputs = [nameInput, emailInput, newPasswordInput, confirmPasswordInput]

  const editButton = document.getElementById("editButton")
  const saveButton = document.getElementById("saveButton")
  const cancelButton = document.getElementById("cancelButton")
  const errorMessageDiv = document.getElementById("errorMessage")

  async function carregarInformacoesUsuario() {
    const usuarioLocal = window.AuthUtils.getCurrentUser();
    if (!usuarioLocal || !usuarioLocal.id) {
      showError("Usuário não encontrado.");
      return;
    }

    window.showGlobalLoading && window.showGlobalLoading();
    try {
      const usuario = await window.API_CONFIG.authenticatedRequest(`/usuarios/${usuarioLocal.id}`);
      usuarioOriginal = { ...usuario };

      profileName.textContent = usuario.nome;
      profileEmail.textContent = usuario.email;
      profileInitials.textContent = getInitials(usuario.nome);

      nameInput.value = usuario.nome;
      emailInput.value = usuario.email;
    } catch (error) {
      showError("Erro ao carregar informações do usuário.");
    } finally {
      window.hideGlobalLoading && window.hideGlobalLoading();
    }
  }

  function getInitials(name) {
    if (!name) return "U"
    const words = name.trim().split(" ")
    const initials = words.map((word) => word.charAt(0).toUpperCase()).join("")
    return initials.substring(0, 2)
  }

  function alternarModoEdicao(editar) {
    modoEdicao = editar

    if (editar) {
      editButton.classList.add("hidden")
      saveButton.classList.remove("hidden")
      cancelButton.classList.remove("hidden")
    } else {
      editButton.classList.remove("hidden")
      saveButton.classList.add("hidden")
      cancelButton.classList.add("hidden")
    }

    allInputs.forEach((input) => {
      if (input.id !== "emailInput") {
        input.disabled = !editar
      }
    })

    if (!editar) {
      newPasswordInput.value = ""
      confirmPasswordInput.value = ""
      hideError()
      nameInput.value = usuarioOriginal.nome
    }
  }

  async function salvarAlteracoes() {
    hideError()
    const nome = nameInput.value.trim()
    const novaSenha = newPasswordInput.value
    const confirmarSenha = confirmPasswordInput.value

    if (!nome) {
      showError("O campo nome é obrigatório.")
      return
    }

    if (novaSenha !== confirmarSenha) {
      showError("As senhas não coincidem.")
      return
    }

    const payload = {
      id: usuarioOriginal.id,
      nome: nome,
    }

    if (novaSenha) {
      payload.senha = novaSenha
    }

    showButtonLoading(true)

    try {
      const response = await API_CONFIG.authenticatedRequest(`/usuarios/${usuarioOriginal.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      })

      const usuarioAtualizado = await API_CONFIG.authenticatedRequest(`/usuarios/${usuarioOriginal.id}`);
      window.AuthUtils.saveUser(usuarioAtualizado);

      showToast("Perfil atualizado com sucesso!", "success")
      carregarInformacoesUsuario()
      alternarModoEdicao(false)
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      showError(error.message || "Erro desconhecido ao salvar.")
    } finally {
      showButtonLoading(false)
    }
  }

  function showError(message) {
    errorMessageDiv.textContent = message
    errorMessageDiv.classList.remove("hidden")
  }

  function hideError() {
    errorMessageDiv.classList.add("hidden")
  }

  function showButtonLoading(show) {
    const textSpan = saveButton.querySelector("[data-text]")
    const loadingSpan = saveButton.querySelector("[data-loading]")

    if (show) {
      textSpan.classList.add("hidden")
      loadingSpan.classList.remove("hidden")
      saveButton.disabled = true
    } else {
      textSpan.classList.remove("hidden")
      loadingSpan.classList.add("hidden")
      saveButton.disabled = false
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

  function configurarBotoes() {
    editButton.addEventListener("click", () => alternarModoEdicao(true))
    saveButton.addEventListener("click", salvarAlteracoes)
    cancelButton.addEventListener("click", () => alternarModoEdicao(false))
    if (window.Utils && typeof window.Utils.setupLogoutButton === 'function') {
      window.Utils.setupLogoutButton();
    }
  }

  waitForDependencies().then(() => {
    carregarInformacoesUsuario()
    configurarBotoes()
  })

  function waitForDependencies() {
    return new Promise((resolve) => {
      const check = () => {
        if (window.Utils && window.API_CONFIG && window.AuthUtils) {
          resolve()
        } else {
          setTimeout(check, 100)
        }
      }
      check()
    })
  }
})
