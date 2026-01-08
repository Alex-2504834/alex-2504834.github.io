"use strict"

const domQuerySelector = (selector) => document.querySelector(selector)

const animationDurationMs = 220
const animationKeyframes = [
  { transform: "translateY(0)" },
  { transform: "translateY(-2px)" },
  { transform: "translateY(0)" },
]

const dataFolderPrefix = "./data/"
const siteJsonPath = `${dataFolderPrefix}site.json`
const linksJsonPath = `${dataFolderPrefix}links.json`
const aboutJsonPath = `${dataFolderPrefix}about.json`
const projectsJsonPath = `${dataFolderPrefix}projects.json`
const skillsJsonPath = `${dataFolderPrefix}skills.json`

const selectorSiteName = "#siteName"
const selectorHeadline = "#headline"
const selectorTagline = "#tagline"
const selectorMeta = "#meta"
const selectorAboutTitle = "#aboutTitle"
const selectorAboutBody = "#aboutBody"
const selectorProjectGrid = "#projectGrid"
const selectorSkillsList = "#skillsList"
const selectorLinkChips = "#linkChips"
const selectorFootText = "#footText"

const errorUiPaddingPx = 20
const errorUiFontFamily = "system-ui"
const errorUiTextColor = "#eaf2f7"

const createElement = (tagName, className) => {
  const element = document.createElement(tagName)
  if (className) element.className = className
  return element
}

const setTextContent = (element, text) => {
  if (element) element.textContent = text ?? ""
}

const asArray = (value) => (Array.isArray(value) ? value : [])

const toYearNumber = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : -1
}

const isSafeUrl = (url) => {
  if (typeof url !== "string") return false
  const trimmed = url.trim()
  if (!trimmed) return false

  if (trimmed.startsWith("//")) return false

  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("../") ||
    trimmed.startsWith("#")
  ) {
    return true
  }

  try {
    const parsed = new URL(trimmed, window.location.origin)
    return ["http:", "https:", "mailto:"].includes(parsed.protocol)
  } catch {
    return false
  }
}

const getUrlMeta = (rawUrl) => {
  const trimmed = String(rawUrl ?? "").trim()
  try {
    const parsed = new URL(trimmed, window.location.origin)
    const isHttp = parsed.protocol === "http:" || parsed.protocol === "https:"
    const isExternal = isHttp && parsed.origin !== window.location.origin
    return { href: parsed.href, isExternal }
  } catch {
    return { href: trimmed, isExternal: false }
  }
}

const loadJson = async (filePath) => {
  const response = await fetch(filePath, { cache: "no-store" })
  const isOk = response.status >= 200 && response.status < 300
  if (!isOk) throw new Error(`Failed to load ${filePath} (${response.status})`)
  return response.json()
}

const createPill = (label, value, variantClassName, enableCopyOnClick = false) => {
  const variantClassToken = variantClassName || ""
  const combinedClassName = `pill ${variantClassToken}`.trim()

  const pillElement = createElement("span", combinedClassName)
  const indicatorElement = createElement("span", "k")
  const textContainerElement = createElement("span")
  const strongElement = createElement("strong")

  strongElement.textContent = `${label}:`
  textContainerElement.appendChild(strongElement)
  textContainerElement.appendChild(document.createTextNode(` ${value ?? ""}`))

  pillElement.append(indicatorElement, textContainerElement)

  if (enableCopyOnClick) {
    const originalTitle = pillElement.title
    pillElement.style.cursor = "pointer"
    pillElement.title = "Click to copy"

    pillElement.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(String(value ?? ""))
        pillElement.animate(animationKeyframes, { duration: animationDurationMs })
        pillElement.title = "Copied!"
        setTimeout(() => (pillElement.title = "Click to copy"), 900)
      } catch (err) {
        console.warn("Clipboard write failed:", err)
        pillElement.title = "Copy failed (needs HTTPS)"
        setTimeout(() => (pillElement.title = originalTitle || "Click to copy"), 1600)
      }
    })
  }

  return pillElement
}

const createSafeLinkElement = ({ url, label }) => {
  const linkElement = createElement("a")
  linkElement.textContent = label ?? ""

  if (!isSafeUrl(url)) {
    linkElement.href = "#"
    linkElement.title = "Invalid link"
    linkElement.setAttribute("aria-disabled", "true")
    linkElement.tabIndex = -1
    linkElement.style.pointerEvents = "none"
    linkElement.style.opacity = "0.6"
    return linkElement
  }

  const meta = getUrlMeta(url)
  linkElement.href = meta.href

  if (meta.isExternal) {
    linkElement.target = "_blank"
    linkElement.rel = "noopener noreferrer"
  }

  return linkElement
}

const createProjectCard = (project) => {
  const cardElement = createElement("article", "card")

  const topLineElement = createElement("div", "topline")
  const titleElement = createElement("h3")
  titleElement.textContent = project?.title ?? ""

  const yearElement = createElement("span", "year")
  yearElement.textContent = project?.year ?? ""

  topLineElement.append(titleElement, yearElement)

  const summaryElement = createElement("p", "muted")
  summaryElement.textContent = project?.summary ?? ""

  const tagsContainerElement = createElement("div", "tags")

  asArray(project?.tags).forEach((tagText) => {
    const tagElement = createElement("span", "tag")
    tagElement.textContent = tagText ?? ""
    tagsContainerElement.appendChild(tagElement)
  })

  if (project?.featured) {
    const featuredTagElement = createElement("span", "tag featured")
    featuredTagElement.textContent = "Featured"
    tagsContainerElement.appendChild(featuredTagElement)
  }

  const linksContainerElement = createElement("div", "links")
  asArray(project?.links).forEach((link) => {
    const url = link?.url ?? ""
    const label = link?.label ?? ""
    linksContainerElement.appendChild(createSafeLinkElement({ url, label }))
  })

  cardElement.append(topLineElement, summaryElement, tagsContainerElement, linksContainerElement)
  return cardElement
}

const renderSite = (data) => {
  document.title = `${data?.site?.name ?? "Portfolio"} - Portfolio`
  setTextContent(domQuerySelector(selectorSiteName), data?.site?.name ?? "")

  setTextContent(
    domQuerySelector(selectorHeadline),
    `${data?.site?.name ?? ""} - ${data?.site?.role ?? ""}`.trim()
  )
  setTextContent(domQuerySelector(selectorTagline), data?.site?.tagline ?? "")

  const metaElement = domQuerySelector(selectorMeta)
  if (metaElement) {
    metaElement.replaceChildren(
      createPill("Status", data?.site?.availability ?? "", "accent"),
      createPill("Location", data?.site?.location ?? ""),
      createPill("Email", data?.site?.email ?? "", "accent2", true)
    )
  }

  setTextContent(domQuerySelector(selectorAboutTitle), data?.about?.title ?? "")

  const aboutBodyElement = domQuerySelector(selectorAboutBody)
  if (aboutBodyElement) {
    const frag = document.createDocumentFragment()
    asArray(data?.about?.body).forEach((line) => {
      const paragraphElement = createElement("p")
      paragraphElement.textContent = line ?? ""
      frag.appendChild(paragraphElement)
    })
    aboutBodyElement.replaceChildren(frag)
  }

  const projectGridElement = domQuerySelector(selectorProjectGrid)
  if (projectGridElement) {
    const sortedProjects = [...asArray(data?.projects)].sort((a, b) => {
      const yearDiff = toYearNumber(b?.year) - toYearNumber(a?.year)
      if (yearDiff !== 0) return yearDiff
      return String(a?.title ?? "").localeCompare(String(b?.title ?? ""))
    })

    const frag = document.createDocumentFragment()
    sortedProjects.forEach((project) => frag.appendChild(createProjectCard(project)))
    projectGridElement.replaceChildren(frag)
  }

  const skillsListElement = domQuerySelector(selectorSkillsList)
  if (skillsListElement) {
    const frag = document.createDocumentFragment()

    asArray(data?.skills).forEach((skill) => {
      const listItemElement = createElement("li")

      const skillNameElement = createElement("span")
      skillNameElement.textContent = skill?.name ?? ""

      const skillLevelElement = createElement("span", "level")
      skillLevelElement.textContent = skill?.level ?? ""

      listItemElement.append(skillNameElement, skillLevelElement)
      frag.appendChild(listItemElement)
    })

    skillsListElement.replaceChildren(frag)
  }

  const linkChipsElement = domQuerySelector(selectorLinkChips)
  if (linkChipsElement) {
    const frag = document.createDocumentFragment()

    asArray(data?.links).forEach((link) => {
      const url = link?.url ?? ""
      const label = link?.label ?? ""
      frag.appendChild(createSafeLinkElement({ url, label }))
    })

    linkChipsElement.replaceChildren(frag)
  }

  const currentYear = new Date().getFullYear()
  setTextContent(
    domQuerySelector(selectorFootText),
    `© ${currentYear} ${data?.site?.name ?? ""}. Built from JSON.`
  )
}

const buildErrorHtml = (message) => {
  const safeMessage = String(message ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")

  return `<div style="padding:${errorUiPaddingPx}px;color:${errorUiTextColor};font-family:${errorUiFontFamily}">
    <h1>Couldn't load JSON</h1>
    <p>${safeMessage}</p>
  </div>`
}

const loadAllContent = async () => {
  const [site, links, about, projects, skills] = await Promise.all([
    loadJson(siteJsonPath),
    loadJson(linksJsonPath),
    loadJson(aboutJsonPath),
    loadJson(projectsJsonPath),
    loadJson(skillsJsonPath),
  ])

  return { site, links, about, projects, skills }
}

loadAllContent()
  .then(renderSite)
  .catch((error) => {
    console.error(error)
    document.body.innerHTML = buildErrorHtml(error.message)
  })
