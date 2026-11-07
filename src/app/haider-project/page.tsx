'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Lock,
  Unlock,
  Key,
  Shield,
  CheckCircle,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Layers,
  ArrowRight,
  ExternalLink,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Upload,
  Download,
  Smartphone,
  Check,
  X,
  Sliders,
  Settings,
  HelpCircle,
  Eye,
} from 'lucide-react';
import type { PageSeoConfig, RedirectRule, GlobalSeoSettings, SeoStoreData, BreadcrumbItem, FaqItem } from '@/lib/seo-service';

const SaveIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

const GlobeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

const MonitorIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const LogOutIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const TagIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const LinkIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

export default function HaiderProjectAdmin() {
  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Store data
  const [storeData, setStoreData] = useState<SeoStoreData | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string>('/');
  const [activeTab, setActiveTab] = useState<'serp' | 'image' | 'robots' | 'schema' | 'content' | 'links' | 'redirects' | 'settings'>('serp');
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'mobile'>('desktop');

  // Page editor state
  const [currentPage, setCurrentPage] = useState<PageSeoConfig | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirects state
  const [redirects, setRedirects] = useState<RedirectRule[]>([]);
  const [newRedirectSource, setNewRedirectSource] = useState('');
  const [newRedirectDestination, setNewRedirectDestination] = useState('');
  const [newRedirectPermanent, setNewRedirectPermanent] = useState(true);
  const [newRedirectNotes, setNewRedirectNotes] = useState('');

  // Global settings state
  const [globalSettings, setGlobalSettings] = useState<GlobalSeoSettings>({
    siteName: 'Convertir Word a PDF',
    baseUrl: 'https://convertirwordapdf.net',
    defaultOgImage: 'https://convertirwordapdf.net/icon-512.png',
    twitterHandle: '@convertirwordapdf',
    googleSiteVerification: '',
    bingSiteVerification: '',
    googleAnalyticsId: '',
  });

  // Schema json raw editing state
  const [schemaText, setSchemaText] = useState('');
  const [schemaError, setSchemaError] = useState<string | null>(null);

  // New page modal
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageName, setNewPageName] = useState('');

  // Secondary keyword tag input
  const [secondaryTagInput, setSecondaryTagInput] = useState('');

  // 1. Initial Auth Check
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth');
      const data = await res.json();
      if (data.ok && data.authenticated) {
        setIsAuthenticated(true);
        loadSeoStore();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();

      if (data.ok) {
        setIsAuthenticated(true);
        setPasswordInput('');
        loadSeoStore();
      } else {
        setAuthError(data.error || 'Contraseña incorrecta');
      }
    } catch {
      setAuthError('Error de red al conectar con el servidor');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } finally {
      setIsAuthenticated(false);
      setStoreData(null);
      setCurrentPage(null);
    }
  };

  const loadSeoStore = async () => {
    try {
      const res = await fetch('/api/admin/seo');
      const data = await res.json();
      if (data.ok && data.data) {
        setStoreData(data.data);
        setRedirects(data.data.redirects || []);
        if (data.data.globalSettings) {
          setGlobalSettings(data.data.globalSettings);
        }

        const pages = data.data.pages || {};
        const firstSlug = Object.keys(pages)[0] || '/';
        const targetSlug = pages[selectedSlug] ? selectedSlug : firstSlug;
        setSelectedSlug(targetSlug);
        if (pages[targetSlug]) {
          const p = JSON.parse(JSON.stringify(pages[targetSlug]));
          setCurrentPage(p);
          setSchemaText(JSON.stringify(p.schemaJsonLd || {}, null, 2));
        }
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error('Error loading store:', err);
    }
  };

  // Switch selected page
  const handleSelectPage = (slug: string) => {
    if (hasUnsavedChanges) {
      if (!confirm('Tienes cambios sin guardar en esta página. ¿Deseas descartarlos y cambiar de página?')) {
        return;
      }
    }
    setSelectedSlug(slug);
    if (storeData && storeData.pages[slug]) {
      const p = JSON.parse(JSON.stringify(storeData.pages[slug]));
      setCurrentPage(p);
      setSchemaText(JSON.stringify(p.schemaJsonLd || {}, null, 2));
      setSchemaError(null);
      setHasUnsavedChanges(false);
    }
  };

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentPage && isAuthenticated) {
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Save handler
  const handleSave = async (overridePage?: PageSeoConfig) => {
    const targetPage = overridePage || currentPage;
    if (!targetPage) return;

    setSaveStatus('saving');
    setSaveMessage('Guardando cambios en el servidor...');

    try {
      // Validate schema if currently edited
      let validatedSchema = targetPage.schemaJsonLd;
      try {
        validatedSchema = JSON.parse(schemaText);
        setSchemaError(null);
      } catch (e: any) {
        setSchemaError(e.message || 'JSON de Schema inválido');
        setSaveStatus('error');
        setSaveMessage('Error: Corrige los errores en el Schema JSON antes de guardar.');
        return;
      }

      const payloadPage: PageSeoConfig = {
        ...targetPage,
        schemaJsonLd: validatedSchema,
        lastModified: new Date().toISOString(),
      };

      const res = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: payloadPage,
          redirects,
          globalSettings,
        }),
      });

      const resData = await res.json();
      if (resData.ok) {
        setSaveStatus('saved');
        setSaveMessage('¡Cambios guardados con éxito!');
        setHasUnsavedChanges(false);

        // Update local store
        setStoreData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            pages: {
              ...prev.pages,
              [payloadPage.slug]: payloadPage,
            },
            redirects,
            globalSettings,
          };
        });
        setCurrentPage(payloadPage);

        setTimeout(() => {
          setSaveStatus('idle');
        }, 3500);
      } else {
        setSaveStatus('error');
        setSaveMessage(resData.error || 'Error al guardar');
      }
    } catch {
      setSaveStatus('error');
      setSaveMessage('Error de conexión con el servidor');
    }
  };

  // Handle Feature Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentPage) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.ok && data.url) {
        const updated: PageSeoConfig = {
          ...currentPage,
          featureImage: {
            ...currentPage.featureImage,
            url: data.url,
            alt: currentPage.featureImage.alt || currentPage.seoTitle,
            title: currentPage.featureImage.title || currentPage.seoTitle,
          },
          openGraph: {
            ...currentPage.openGraph,
            image: data.url,
          },
        };
        setCurrentPage(updated);
        setHasUnsavedChanges(true);
      } else {
        alert(data.error || 'Error subiendo la imagen');
      }
    } catch {
      alert('Error de red al subir la imagen');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Real-time SEO Analysis Checklist
  const seoChecklist = useMemo(() => {
    if (!currentPage) return [];

    const title = currentPage.seoTitle || '';
    const desc = currentPage.metaDescription || '';
    const kw = (currentPage.focusKeyword || '').toLowerCase().trim();
    const slug = currentPage.slug || '';
    const h1 = currentPage.content?.h1 || '';

    const checks = [
      {
        id: 'kw-set',
        title: 'Palabra Clave Principal Definida',
        passed: Boolean(kw),
        hint: kw ? `Foco: "${kw}"` : 'Define una palabra clave principal para auditar este contenido.',
      },
      {
        id: 'kw-title',
        title: 'Palabra Clave en el SEO Title',
        passed: kw ? title.toLowerCase().includes(kw) : false,
        hint: 'Incluir la palabra clave principal en el título mejora significativamente el CTR y relevancia en Google.',
      },
      {
        id: 'title-len',
        title: 'Longitud del Título (45 - 65 carácteres)',
        passed: title.length >= 45 && title.length <= 65,
        hint: `Actual: ${title.length} carácteres. Si supera los 65 carácteres, Google lo truncará con puntos suspensivos (...).`,
      },
      {
        id: 'kw-desc',
        title: 'Palabra Clave en la Meta Descripción',
        passed: kw ? desc.toLowerCase().includes(kw) : false,
        hint: 'Aparecerá en negrita en las SERPs de Google cuando el usuario busque tu palabra clave.',
      },
      {
        id: 'desc-len',
        title: 'Longitud de Meta Descripción (120 - 160 carácteres)',
        passed: desc.length >= 120 && desc.length <= 160,
        hint: `Actual: ${desc.length} carácteres. Lo ideal es entre 120 y 160 para aprovechar el snippet completo sin truncar.`,
      },
      {
        id: 'kw-slug',
        title: 'Palabra Clave en la URL (Slug)',
        passed: slug === '/' ? true : kw ? slug.toLowerCase().replace(/[^a-z0-9]/g, ' ').includes(kw.replace(/[^a-z0-9]/g, ' ')) : false,
        hint: 'Una URL limpia y que contenga la palabra clave transmite señales claras a los rastreadores.',
      },
      {
        id: 'kw-h1',
        title: 'Palabra Clave en el Encabezado H1',
        passed: kw ? h1.toLowerCase().includes(kw) : false,
        hint: 'El H1 debe reflejar el objetivo de la página y contener la palabra clave de búsqueda.',
      },
      {
        id: 'feature-img',
        title: 'Imagen Destacada con Alt Text optimizado',
        passed: Boolean(currentPage.featureImage?.url && currentPage.featureImage?.alt),
        hint: currentPage.featureImage?.url
          ? currentPage.featureImage?.alt
            ? 'Imagen y texto alternativo configurados correctamente.'
            : '¡Atención! Falta el texto ALT en la imagen destacada.'
          : 'Añade una imagen destacada para habilitar Social Cards atractivas en Twitter, WhatsApp y Facebook.',
      },
      {
        id: 'schema-ready',
        title: 'Schema JSON-LD Estructurado Válido',
        passed: Boolean(currentPage.schemaJsonLd && Object.keys(currentPage.schemaJsonLd).length > 0 && !schemaError),
        hint: 'El Schema estructurado permite Rich Snippets y FAQs desplegables en Google.',
      },
      {
        id: 'robots-index',
        title: 'Estado de Indexación en Buscadores',
        passed: currentPage.robots?.index === true,
        hint: currentPage.robots?.index ? 'Página indexable por Google y Bing.' : 'AVISO: Esta página está configurada en NOINDEX.',
      },
    ];

    return checks;
  }, [currentPage, schemaError]);

  const seoScore = useMemo(() => {
    if (!seoChecklist.length) return 0;
    const passed = seoChecklist.filter((c) => c.passed).length;
    return Math.round((passed / seoChecklist.length) * 100);
  }, [seoChecklist]);

  // Handle Redirect additions
  const handleAddRedirect = () => {
    if (!newRedirectSource || !newRedirectDestination) {
      alert('Debes indicar la URL origen y destino');
      return;
    }

    const newRule: RedirectRule = {
      id: `red-${Date.now()}`,
      source: newRedirectSource.trim(),
      destination: newRedirectDestination.trim(),
      permanent: newRedirectPermanent,
      active: true,
      notes: newRedirectNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updated = [newRule, ...redirects];
    setRedirects(updated);
    setNewRedirectSource('');
    setNewRedirectDestination('');
    setNewRedirectNotes('');
    setHasUnsavedChanges(true);
  };

  const handleDeleteRedirect = (id: string) => {
    setRedirects(redirects.filter((r) => r.id !== id));
    setHasUnsavedChanges(true);
  };

  const handleToggleRedirect = (id: string) => {
    setRedirects(
      redirects.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
    setHasUnsavedChanges(true);
  };

  // Handle New Page creation
  const handleCreateNewPage = () => {
    if (!newPageSlug || !newPageName) {
      alert('Indica el slug y el nombre de la página');
      return;
    }

    let slug = newPageSlug.trim();
    if (!slug.startsWith('/')) slug = '/' + slug;
    if (!slug.endsWith('/') && slug !== '/') slug = slug + '/';

    if (storeData?.pages[slug]) {
      alert('Ya existe una página con este slug');
      return;
    }

    const newPage: PageSeoConfig = {
      id: slug.replace(/[^a-zA-Z0-9]/g, '-').replace(/^-+|-+$/g, '') || 'page',
      slug,
      name: newPageName.trim(),
      seoTitle: `${newPageName.trim()} | Convertir Word a PDF`,
      metaDescription: `Herramienta online para ${newPageName.trim()}. Rápido, seguro y gratuito sin límites.`,
      focusKeyword: newPageName.trim().toLowerCase(),
      secondaryKeywords: [],
      canonicalUrl: `https://convertirwordapdf.net${slug}`,
      robots: {
        index: true,
        follow: true,
        noarchive: false,
        nosnippet: false,
        maxSnippet: -1,
        maxImagePreview: 'large',
      },
      openGraph: {
        title: `${newPageName.trim()} | Convertir Word a PDF`,
        description: `Herramienta online para ${newPageName.trim()}. Rápido, seguro y gratuito.`,
        image: 'https://convertirwordapdf.net/icon-512.png',
        type: 'website',
      },
      featureImage: {
        url: '/icon-512.png',
        alt: newPageName.trim(),
        title: newPageName.trim(),
        width: 1200,
        height: 630,
      },
      breadcrumbs: [
        { name: 'Inicio', item: 'https://convertirwordapdf.net/' },
        { name: newPageName.trim(), item: `https://convertirwordapdf.net${slug}` },
      ],
      schemaJsonLd: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: newPageName.trim(),
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'All',
      },
      content: {
        h1: newPageName.trim(),
        subtitle: `Convierte tus documentos en línea con ${newPageName.trim()}.`,
      },
      faqs: [],
      sitemap: {
        includeInSitemap: true,
        priority: 0.8,
        changeFrequency: 'weekly',
      },
      lastModified: new Date().toISOString(),
    };

    setStoreData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: {
          ...prev.pages,
          [slug]: newPage,
        },
      };
    });

    setSelectedSlug(slug);
    setCurrentPage(newPage);
    setSchemaText(JSON.stringify(newPage.schemaJsonLd, null, 2));
    setShowNewPageModal(false);
    setNewPageSlug('');
    setNewPageName('');
    setHasUnsavedChanges(true);
  };

  // Add Secondary Keyword
  const handleAddSecondaryTag = () => {
    if (!secondaryTagInput.trim() || !currentPage) return;
    const tag = secondaryTagInput.trim().toLowerCase();
    const existing = currentPage.secondaryKeywords || [];
    if (!existing.includes(tag)) {
      setCurrentPage({
        ...currentPage,
        secondaryKeywords: [...existing, tag],
      });
      setHasUnsavedChanges(true);
    }
    setSecondaryTagInput('');
  };

  const handleRemoveSecondaryTag = (tag: string) => {
    if (!currentPage) return;
    setCurrentPage({
      ...currentPage,
      secondaryKeywords: (currentPage.secondaryKeywords || []).filter((t) => t !== tag),
    });
    setHasUnsavedChanges(true);
  };

  // FAQ management
  const handleAddFaq = () => {
    if (!currentPage) return;
    const newFaq: FaqItem = {
      question: '¿Pregunta frecuente de ejemplo?',
      answer: 'Respuesta clara y detallada para resolver la consulta de los usuarios y destacar en rich snippets.',
    };
    setCurrentPage({
      ...currentPage,
      faqs: [...(currentPage.faqs || []), newFaq],
    });
    setHasUnsavedChanges(true);
  };

  const handleUpdateFaq = (idx: number, field: 'question' | 'answer', value: string) => {
    if (!currentPage) return;
    const faqs = [...(currentPage.faqs || [])];
    faqs[idx] = { ...faqs[idx], [field]: value };
    setCurrentPage({ ...currentPage, faqs });
    setHasUnsavedChanges(true);
  };

  const handleRemoveFaq = (idx: number) => {
    if (!currentPage) return;
    const faqs = (currentPage.faqs || []).filter((_, i) => i !== idx);
    setCurrentPage({ ...currentPage, faqs });
    setHasUnsavedChanges(true);
  };

  // Breadcrumb management
  const handleAddBreadcrumb = () => {
    if (!currentPage) return;
    const newItem: BreadcrumbItem = {
      name: 'Nueva Sección',
      item: `https://convertirwordapdf.net/`,
    };
    setCurrentPage({
      ...currentPage,
      breadcrumbs: [...(currentPage.breadcrumbs || []), newItem],
    });
    setHasUnsavedChanges(true);
  };

  const handleUpdateBreadcrumb = (idx: number, field: 'name' | 'item', value: string) => {
    if (!currentPage) return;
    const items = [...(currentPage.breadcrumbs || [])];
    items[idx] = { ...items[idx], [field]: value };
    setCurrentPage({ ...currentPage, breadcrumbs: items });
    setHasUnsavedChanges(true);
  };

  const handleRemoveBreadcrumb = (idx: number) => {
    if (!currentPage) return;
    const items = (currentPage.breadcrumbs || []).filter((_, i) => i !== idx);
    setCurrentPage({ ...currentPage, breadcrumbs: items });
    setHasUnsavedChanges(true);
  };

  // Backup Export
  const handleExportBackup = () => {
    if (!storeData) return;
    const jsonStr = JSON.stringify(storeData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `convertirwordapdf-seo-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Backup Import
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (!parsed.pages || typeof parsed.pages !== 'object') {
          alert('El archivo no parece una copia de seguridad SEO válida.');
          return;
        }

        if (confirm('¿Estás seguro de restaurar esta copia de seguridad? Se sobreescribirán los ajustes actuales.')) {
          const res = await fetch('/api/admin/seo', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullStore: parsed }),
          });
          const data = await res.json();
          if (data.ok) {
            alert('¡Configuración restaurada con éxito!');
            loadSeoStore();
          } else {
            alert('Error al restaurar: ' + data.error);
          }
        }
      } catch (err: any) {
        alert('Error al leer el archivo JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // ==========================================
  // VIEW 1: AUTHENTICATION LOGIN SCREEN
  // ==========================================
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-300">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="font-medium text-lg">Comprobando permisos de seguridad...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Brand header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/25 mb-4 border border-blue-400/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Haider Project — SEO Command Center
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Panel Administrativo de Metadatos, Redirecciones e Indexación
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl p-8">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Acceso Restringido</span>
            </div>

            {authError && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Contraseña de Administrador
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Introduce la contraseña"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 transition-all shadow-lg shadow-blue-600/30"
              >
                {authLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verificando credencial...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Desbloquear Panel SEO</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
              <Link
                href="/"
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1.5"
              >
                <span>← Volver a Convertir Word a PDF</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED SEO DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Left branding & page selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base tracking-tight">Haider Project</span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                    SEO Master
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Control Integral de Metadatos y Posicionamiento
                </p>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-800 hidden md:block" />

            {/* Page dropdown selector */}
            <div className="relative">
              <select
                value={selectedSlug}
                onChange={(e) => {
                  if (e.target.value === '__NEW__') {
                    setShowNewPageModal(true);
                  } else {
                    handleSelectPage(e.target.value);
                  }
                }}
                className="bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-lg px-3 py-1.5 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer max-w-[220px] sm:max-w-[280px] truncate"
              >
                {storeData &&
                  Object.keys(storeData.pages || {}).map((slug) => {
                    const p = storeData.pages[slug];
                    return (
                      <option key={slug} value={slug}>
                        {p.name || slug} ({slug})
                      </option>
                    );
                  })}
                <option value="__NEW__">+ Añadir Nueva Página...</option>
              </select>
            </div>

            {/* Visit Page Live Button */}
            {currentPage && (
              <a
                href={currentPage.slug}
                target="_blank"
                rel="noreferrer"
                className="hidden lg:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Abrir página en vivo"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver página</span>
              </a>
            )}
          </div>

          {/* Right actions: Save Status, Save Button, Logout */}
          <div className="flex items-center gap-3">
            {/* Unsaved indicator */}
            {hasUnsavedChanges && (
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-800/40 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Cambios sin guardar</span>
              </div>
            )}

            {saveStatus === 'saved' && (
              <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <Check className="w-4 h-4" />
                <span>Guardado</span>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={() => handleSave()}
              disabled={saveStatus === 'saving'}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-blue-600/25 cursor-pointer"
            >
              {saveStatus === 'saving' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <SaveIcon className="w-3.5 h-3.5" />
                  <span>Guardar (Ctrl+S)</span>
                </>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col gap-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 overflow-x-auto gap-2 scrollbar-none">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('serp')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeTab === 'serp'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>SERP & Metadatos</span>
            </button>

            <button
              onClick={() => setActiveTab('image')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeTab === 'image'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Imagen Destacada & OG</span>
            </button>

            <button
              onClick={() => setActiveTab('robots')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeTab === 'robots'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <GlobeIcon className="w-3.5 h-3.5" />
              <span>Robots & Sitemap</span>
            </button>

            <button
              onClick={() => setActiveTab('schema')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeTab === 'schema'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Schema JSON-LD & Breadcrumbs</span>
            </button>

            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeTab === 'content'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>H1 & FAQs On-Page</span>
            </button>

            <button
              onClick={() => setActiveTab('redirects')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeTab === 'redirects'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Redirecciones 301/302 ({redirects.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Ajustes Globales & Backup</span>
            </button>
          </div>

          {/* Quick Score Badge */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400">Puntuación SEO:</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <div
                className={`w-2 h-2 rounded-full ${
                  seoScore >= 80 ? 'bg-emerald-400' : seoScore >= 50 ? 'bg-amber-400' : 'bg-red-400'
                }`}
              />
              <span className="text-xs font-bold text-white">{seoScore}/100</span>
            </div>
          </div>
        </div>

        {/* Tab 1: SERP Snippet & Metadatos */}
        {activeTab === 'serp' && currentPage && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: Editor Form */}
            <div className="lg:col-span-7 space-y-6">
              {/* Focus Keyword Box */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm font-semibold text-white">Palabra Clave Principal (Focus Keyword)</h2>
                  </div>
                  <span className="text-[11px] text-slate-400">Objetivo primario de búsqueda</span>
                </div>

                <div>
                  <input
                    type="text"
                    value={currentPage.focusKeyword || ''}
                    onChange={(e) => {
                      setCurrentPage({ ...currentPage, focusKeyword: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="ej. convertir word a pdf"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>

                {/* Secondary Keywords */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Palabras Clave Secundarias / Variaciones LSI
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(currentPage.secondaryKeywords || []).map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs border border-slate-700"
                      >
                        <TagIcon className="w-3 h-3 text-blue-400" />
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSecondaryTag(tag)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={secondaryTagInput}
                      onChange={(e) => setSecondaryTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSecondaryTag();
                        }
                      }}
                      placeholder="Añadir variación y presionar Enter..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddSecondaryTag}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              </div>

              {/* SEO Title Input */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white">SEO Title (Etiqueta &lt;title&gt;)</label>
                  <span
                    className={`text-xs font-mono font-medium ${
                      currentPage.seoTitle.length >= 45 && currentPage.seoTitle.length <= 65
                        ? 'text-emerald-400'
                        : currentPage.seoTitle.length > 65
                        ? 'text-red-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {currentPage.seoTitle.length} / 60 carácteres recomendados
                  </span>
                </div>

                <input
                  type="text"
                  value={currentPage.seoTitle}
                  onChange={(e) => {
                    setCurrentPage({ ...currentPage, seoTitle: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Título visible en Google..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />

                {/* Length Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      currentPage.seoTitle.length >= 45 && currentPage.seoTitle.length <= 65
                        ? 'bg-emerald-500'
                        : currentPage.seoTitle.length > 65
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (currentPage.seoTitle.length / 60) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Meta Description Input */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white">Meta Descripción</label>
                  <span
                    className={`text-xs font-mono font-medium ${
                      currentPage.metaDescription.length >= 120 && currentPage.metaDescription.length <= 160
                        ? 'text-emerald-400'
                        : currentPage.metaDescription.length > 160
                        ? 'text-red-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {currentPage.metaDescription.length} / 160 carácteres recomendados
                  </span>
                </div>

                <textarea
                  rows={3}
                  value={currentPage.metaDescription}
                  onChange={(e) => {
                    setCurrentPage({ ...currentPage, metaDescription: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Descripción resumida para el resultado de búsqueda..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-normal leading-relaxed"
                />

                {/* Length Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      currentPage.metaDescription.length >= 120 && currentPage.metaDescription.length <= 160
                        ? 'bg-emerald-500'
                        : currentPage.metaDescription.length > 160
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (currentPage.metaDescription.length / 160) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Canonical URL Input */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4 text-blue-400" />
                    <span>Canonical URL</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const def = `https://convertirwordapdf.net${currentPage.slug}`;
                      setCurrentPage({ ...currentPage, canonicalUrl: def });
                      setHasUnsavedChanges(true);
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 underline"
                  >
                    Restablecer por defecto
                  </button>
                </div>
                <input
                  type="text"
                  value={currentPage.canonicalUrl || ''}
                  onChange={(e) => {
                    setCurrentPage({ ...currentPage, canonicalUrl: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="https://convertirwordapdf.net/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Right 5 cols: Live SERP Preview & SEO Audit Checklist */}
            <div className="lg:col-span-5 space-y-6">
              {/* Interactive SERP Snippet Preview */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Vista Previa de Google (SERP)
                    </h3>
                  </div>

                  {/* Desktop / Mobile Switcher */}
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setDevicePreview('desktop')}
                      className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                        devicePreview === 'desktop'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Vista Escritorio"
                    >
                      <MonitorIcon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-medium hidden sm:inline">Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDevicePreview('mobile')}
                      className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                        devicePreview === 'mobile'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title="Vista Móvil"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-medium hidden sm:inline">Mobile</span>
                    </button>
                  </div>
                </div>

                {/* Google Snippet Card Container */}
                <div
                  className={`bg-white rounded-xl p-4 shadow-sm font-sans text-left transition-all ${
                    devicePreview === 'mobile' ? 'max-w-sm mx-auto border-2 border-slate-300' : 'w-full'
                  }`}
                >
                  {/* Google Header / Breadcrumb */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center p-1 border border-slate-200">
                      <img src="/icon.svg" alt="Favicon" className="w-4 h-4" />
                    </div>
                    <div className="leading-tight">
                      <div className="text-xs font-semibold text-slate-900">
                        Convertir Word a PDF
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate max-w-[260px]">
                        https://convertirwordapdf.net{currentPage.slug}
                      </div>
                    </div>
                  </div>

                  {/* Google Blue Title */}
                  <h4 className="text-blue-800 hover:underline text-base font-normal leading-snug cursor-pointer line-clamp-2">
                    {currentPage.seoTitle || 'Título de ejemplo para Google'}
                  </h4>

                  {/* Google Snippet Description */}
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed line-clamp-3">
                    {currentPage.metaDescription ||
                      'La descripción de tu página aparecerá aquí. Los términos que coincidan con la búsqueda del usuario se mostrarán en negrita.'}
                  </p>
                </div>
              </div>

              {/* Real-Time SEO Checklist Audit */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Auditoría SEO en Vivo
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                    {seoScore} %
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {seoChecklist.map((check) => (
                    <div
                      key={check.id}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        check.passed
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {check.passed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className={`font-semibold ${check.passed ? 'text-emerald-300' : 'text-slate-300'}`}>
                            {check.title}
                          </div>
                          <p className="mt-0.5 text-[11px] opacity-80 leading-normal">{check.hint}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Feature Image & Open Graph */}
        {activeTab === 'image' && currentPage && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: Image Manager & Alt Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Imagen Destacada (Feature Image)</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Se utiliza como tarjeta al compartir en redes sociales y miniatura enriquecida de Google.
                    </p>
                  </div>
                </div>

                {/* Image Preview & Upload buttons */}
                <div className="space-y-4">
                  <div className="relative aspect-[1200/630] w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group">
                    {currentPage.featureImage?.url ? (
                      <img
                        src={currentPage.featureImage.url}
                        alt={currentPage.featureImage.alt || 'Preview'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-6 text-slate-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-40" />
                        <span className="text-xs font-medium">No hay imagen destacada seleccionada</span>
                      </div>
                    )}

                    {/* Overlay with upload trigger */}
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Nueva Imagen</span>
                      </button>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {uploadingImage && (
                    <div className="flex items-center gap-2 text-xs text-blue-400">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Subiendo imagen al servidor...</span>
                    </div>
                  )}

                  {/* Direct Image URL input */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      URL de la Imagen Destacada
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentPage.featureImage?.url || ''}
                        onChange={(e) => {
                          const url = e.target.value;
                          setCurrentPage({
                            ...currentPage,
                            featureImage: { ...currentPage.featureImage, url },
                            openGraph: { ...currentPage.openGraph, image: url },
                          });
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="https://... o /uploads/..."
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Examinar</span>
                      </button>
                    </div>
                  </div>

                  {/* Image Alt Text & Title */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Texto Alternativo (Alt Text - Vital para SEO)
                      </label>
                      <input
                        type="text"
                        value={currentPage.featureImage?.alt || ''}
                        onChange={(e) => {
                          setCurrentPage({
                            ...currentPage,
                            featureImage: { ...currentPage.featureImage, alt: e.target.value },
                          });
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="Descripción descriptiva con palabra clave..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Título de la Imagen (Title Attribute)
                      </label>
                      <input
                        type="text"
                        value={currentPage.featureImage?.title || ''}
                        onChange={(e) => {
                          setCurrentPage({
                            ...currentPage,
                            featureImage: { ...currentPage.featureImage, title: e.target.value },
                          });
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="Título que aparece al posar el cursor..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Open Graph Titles & Description */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white">Metadatos de Redes Sociales (Open Graph)</h3>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Título Social (OG Title)
                  </label>
                  <input
                    type="text"
                    value={currentPage.openGraph?.title || ''}
                    onChange={(e) => {
                      setCurrentPage({
                        ...currentPage,
                        openGraph: { ...currentPage.openGraph, title: e.target.value },
                      });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder={currentPage.seoTitle}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Descripción Social (OG Description)
                  </label>
                  <textarea
                    rows={2}
                    value={currentPage.openGraph?.description || ''}
                    onChange={(e) => {
                      setCurrentPage({
                        ...currentPage,
                        openGraph: { ...currentPage.openGraph, description: e.target.value },
                      });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder={currentPage.metaDescription}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Right 5 cols: Social Share Preview Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Vista Previa en Redes Sociales (Facebook / Twitter)
                  </h3>
                </div>

                {/* Social Card Mockup */}
                <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-xl max-w-sm mx-auto">
                  <div className="aspect-[1200/630] w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                    {currentPage.featureImage?.url ? (
                      <img
                        src={currentPage.featureImage.url}
                        alt="OG"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-slate-600 text-xs">Sin imagen</div>
                    )}
                  </div>

                  <div className="p-3.5 bg-slate-900/90 border-t border-slate-800">
                    <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 block mb-1">
                      convertirwordapdf.net
                    </span>
                    <h4 className="text-xs font-bold text-white line-clamp-1 mb-1">
                      {currentPage.openGraph?.title || currentPage.seoTitle}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                      {currentPage.openGraph?.description || currentPage.metaDescription}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Indexación, Robots & Sitemap */}
        {activeTab === 'robots' && currentPage && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Robots Configuration */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
                <div>
                  <h2 className="text-sm font-semibold text-white">Directivas Robots Meta</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Controla exactamente qué pueden rastrear e indexar los motores de búsqueda en este documento.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Index / Noindex */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="text-xs font-semibold text-white block">Indexar en Buscadores (index / noindex)</span>
                      <span className="text-[11px] text-slate-400">
                        Permite que Google y Bing incluyan esta página en sus resultados de búsqueda.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentPage.robots?.index ?? true}
                        onChange={(e) => {
                          setCurrentPage({
                            ...currentPage,
                            robots: { ...currentPage.robots, index: e.target.checked },
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Follow / Nofollow */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="text-xs font-semibold text-white block">Seguir Enlaces (follow / nofollow)</span>
                      <span className="text-[11px] text-slate-400">
                        Permite a los rastreadores transferir autoridad (PageRank) a través de los enlaces de la página.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentPage.robots?.follow ?? true}
                        onChange={(e) => {
                          setCurrentPage({
                            ...currentPage,
                            robots: { ...currentPage.robots, follow: e.target.checked },
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Noarchive */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="text-xs font-semibold text-white block">No Guardar Caché (noarchive)</span>
                      <span className="text-[11px] text-slate-400">
                        Impide que Google muestre una copia en caché de la página a los usuarios.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentPage.robots?.noarchive ?? false}
                        onChange={(e) => {
                          setCurrentPage({
                            ...currentPage,
                            robots: { ...currentPage.robots, noarchive: e.target.checked },
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Nosnippet */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="text-xs font-semibold text-white block">No Mostrar Snippet (nosnippet)</span>
                      <span className="text-[11px] text-slate-400">
                        Oculta la descripción textual en los resultados de búsqueda.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentPage.robots?.nosnippet ?? false}
                        onChange={(e) => {
                          setCurrentPage({
                            ...currentPage,
                            robots: { ...currentPage.robots, nosnippet: e.target.checked },
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sitemap Settings */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
                <div>
                  <h2 className="text-sm font-semibold text-white">Configuración del Sitemap XML</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configuración automática para sitemap.xml
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Include in sitemap toggle */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="text-xs font-semibold text-white block">Incluir en sitemap.xml</span>
                      <span className="text-[11px] text-slate-400">
                        Aparecerá en el mapa de sitio dinámico enviado a Google Search Console.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentPage.sitemap?.includeInSitemap ?? true}
                        onChange={(e) => {
                          setCurrentPage({
                            ...currentPage,
                            sitemap: { ...currentPage.sitemap, includeInSitemap: e.target.checked },
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Priority Slider */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Prioridad del Sitemap</span>
                      <span className="text-xs font-mono font-bold text-blue-400">
                        {currentPage.sitemap?.priority ?? 0.8}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={currentPage.sitemap?.priority ?? 0.8}
                      onChange={(e) => {
                        setCurrentPage({
                          ...currentPage,
                          sitemap: {
                            ...currentPage.sitemap,
                            priority: parseFloat(e.target.value),
                          },
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0.1 (Baja)</span>
                      <span>0.5 (Normal)</span>
                      <span>1.0 (Máxima)</span>
                    </div>
                  </div>

                  {/* Change Frequency */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="block text-xs font-semibold text-white">Frecuencia de Cambio (changefreq)</label>
                    <select
                      value={currentPage.sitemap?.changeFrequency || 'weekly'}
                      onChange={(e) => {
                        setCurrentPage({
                          ...currentPage,
                          sitemap: {
                            ...currentPage.sitemap,
                            changeFrequency: e.target.value as any,
                          },
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="always">always (Continuamente)</option>
                      <option value="hourly">hourly (Cada hora)</option>
                      <option value="daily">daily (Diario)</option>
                      <option value="weekly">weekly (Semanal)</option>
                      <option value="monthly">monthly (Mensual)</option>
                      <option value="yearly">yearly (Anual)</option>
                      <option value="never">never (Nunca)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Schema JSON-LD & Breadcrumbs */}
        {activeTab === 'schema' && currentPage && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: JSON-LD Raw Code Editor */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Schema Markup Estructurado (JSON-LD)</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Edita directamente el JSON-LD insertado en el &lt;head&gt; de esta página.
                    </p>
                  </div>

                  {/* Schema Preset Quick Pick */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const softwareSchema = {
                          '@context': 'https://schema.org',
                          '@type': 'SoftwareApplication',
                          name: currentPage.seoTitle,
                          applicationCategory: 'UtilityApplication',
                          operatingSystem: 'All',
                          offers: {
                            '@type': 'Offer',
                            price: '0.00',
                            priceCurrency: 'USD',
                          },
                        };
                        const text = JSON.stringify(softwareSchema, null, 2);
                        setSchemaText(text);
                        setCurrentPage({ ...currentPage, schemaJsonLd: softwareSchema });
                        setHasUnsavedChanges(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 transition-colors"
                    >
                      Preset: Software
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const faqSchema = {
                          '@context': 'https://schema.org',
                          '@type': 'FAQPage',
                          mainEntity: (currentPage.faqs || []).map((faq) => ({
                            '@type': 'Question',
                            name: faq.question,
                            acceptedAnswer: {
                              '@type': 'Answer',
                              text: faq.answer,
                            },
                          })),
                        };
                        const text = JSON.stringify(faqSchema, null, 2);
                        setSchemaText(text);
                        setCurrentPage({ ...currentPage, schemaJsonLd: faqSchema });
                        setHasUnsavedChanges(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 transition-colors"
                    >
                      Preset: FAQPage
                    </button>
                  </div>
                </div>

                {schemaError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>Error de sintaxis JSON: {schemaError}</span>
                  </div>
                )}

                <textarea
                  rows={14}
                  value={schemaText}
                  onChange={(e) => {
                    setSchemaText(e.target.value);
                    setHasUnsavedChanges(true);
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setSchemaError(null);
                      setCurrentPage({ ...currentPage, schemaJsonLd: parsed });
                    } catch (err: any) {
                      setSchemaError(err.message);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-emerald-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Right 5 cols: Breadcrumb Manager */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Gestor de Breadcrumbs (Migas de Pan)</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Estructura jerárquica para Google y navegación.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBreadcrumb}
                    className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                    title="Añadir nivel"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Breadcrumbs List */}
                <div className="space-y-3">
                  {(currentPage.breadcrumbs || []).map((b, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-semibold uppercase text-slate-500">
                          Nivel {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBreadcrumb(idx)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={b.name}
                          onChange={(e) => handleUpdateBreadcrumb(idx, 'name', e.target.value)}
                          placeholder="Nombre (ej. Inicio)"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={b.item}
                          onChange={(e) => handleUpdateBreadcrumb(idx, 'item', e.target.value)}
                          placeholder="URL"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}

                  {(!currentPage.breadcrumbs || currentPage.breadcrumbs.length === 0) && (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      No hay breadcrumbs configurados para esta página.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Content On-Page & FAQs */}
        {activeTab === 'content' && currentPage && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 6 cols: H1 and Subtitle */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-white">Contenido Principal On-Page</h2>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Encabezado Principal H1
                  </label>
                  <input
                    type="text"
                    value={currentPage.content?.h1 || ''}
                    onChange={(e) => {
                      setCurrentPage({
                        ...currentPage,
                        content: { ...currentPage.content, h1: e.target.value },
                      });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Título H1 visible en la cabecera..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Subtítulo / Bajada de Hero
                  </label>
                  <textarea
                    rows={3}
                    value={currentPage.content?.subtitle || ''}
                    onChange={(e) => {
                      setCurrentPage({
                        ...currentPage,
                        content: { ...currentPage.content, subtitle: e.target.value },
                      });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Párrafo explicativo bajo el H1..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Right 6 cols: FAQ Accordion Editor */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Preguntas Frecuentes (FAQs)</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Añade y edita preguntas para la sección de FAQ y el Schema FAQPage.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir FAQ</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {(currentPage.faqs || []).map((faq, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-blue-400">
                          FAQ #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(idx)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                        placeholder="Pregunta..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />

                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                        placeholder="Respuesta..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ))}

                  {(!currentPage.faqs || currentPage.faqs.length === 0) && (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No hay preguntas frecuentes en esta página.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Gestor de Redirecciones (301 & 302) */}
        {activeTab === 'redirects' && (
          <div className="space-y-6">
            {/* Add New Redirect Rule Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Añadir Nueva Regla de Redirección</h2>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    URL de Origen (Source)
                  </label>
                  <input
                    type="text"
                    value={newRedirectSource}
                    onChange={(e) => setNewRedirectSource(e.target.value)}
                    placeholder="/url-antigua o /convertir-word"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    URL de Destino (Destination)
                  </label>
                  <input
                    type="text"
                    value={newRedirectDestination}
                    onChange={(e) => setNewRedirectDestination(e.target.value)}
                    placeholder="/ o /pdf-a-word"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tipo de Redirección
                  </label>
                  <select
                    value={newRedirectPermanent ? '301' : '302'}
                    onChange={(e) => setNewRedirectPermanent(e.target.value === '301')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="301">301 (Permanente)</option>
                    <option value="302">302 (Temporal)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddRedirect}
                    className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Añadir Regla</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Redirects Table */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Reglas de Redirección Activas en Middleware ({redirects.length})
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4">Origen (Source)</th>
                      <th className="py-3 px-4">Destino (Target)</th>
                      <th className="py-3 px-4">Código HTTP</th>
                      <th className="py-3 px-4">Notas</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {redirects.map((rule) => (
                      <tr key={rule.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleRedirect(rule.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                              rule.active
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {rule.active ? 'Activo' : 'Pausado'}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-mono text-white font-medium">{rule.source}</td>
                        <td className="py-3 px-4 font-mono text-blue-400">{rule.destination}</td>
                        <td className="py-3 px-4 font-mono font-bold">
                          {rule.permanent ? (
                            <span className="text-emerald-400">301 Permanent</span>
                          ) : (
                            <span className="text-amber-400">302 Temporary</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{rule.notes || '—'}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteRedirect(rule.id)}
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                            title="Eliminar regla"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {redirects.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No hay reglas de redirección configuradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Global Settings & Backup */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Global Settings */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-white">Ajustes Globales del Sitio Web</h2>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Nombre de la Marca (Site Name)
                    </label>
                    <input
                      type="text"
                      value={globalSettings.siteName}
                      onChange={(e) => {
                        setGlobalSettings({ ...globalSettings, siteName: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      URL Base de Producción
                    </label>
                    <input
                      type="text"
                      value={globalSettings.baseUrl}
                      onChange={(e) => {
                        setGlobalSettings({ ...globalSettings, baseUrl: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Código de Verificación Google Search Console
                    </label>
                    <input
                      type="text"
                      value={globalSettings.googleSiteVerification || ''}
                      onChange={(e) => {
                        setGlobalSettings({ ...globalSettings, googleSiteVerification: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="google-site-verification=..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      ID de Medición Google Analytics 4 (Measurement ID)
                    </label>
                    <input
                      type="text"
                      value={globalSettings.googleAnalyticsId || ''}
                      onChange={(e) => {
                        setGlobalSettings({ ...globalSettings, googleAnalyticsId: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="G-XXXXXXXXXX"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Introduce tu ID de Google Analytics (comienza por G-). El script oficial gtag.js se inyectará automáticamente en todas las páginas.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Cuenta de Twitter / X
                    </label>
                    <input
                      type="text"
                      value={globalSettings.twitterHandle}
                      onChange={(e) => {
                        setGlobalSettings({ ...globalSettings, twitterHandle: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Backup & Restore */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white">Copias de Seguridad (Backup & Restore)</h3>
                <p className="text-xs text-slate-400">
                  Exporta toda la configuración SEO (títulos, descripciones, schemas, redirecciones) en un archivo JSON descargable o restáurala en cualquier momento.
                </p>

                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors border border-slate-700"
                  >
                    <Download className="w-4 h-4 text-blue-400" />
                    <span>Descargar Backup SEO (JSON)</span>
                  </button>

                  <label className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors border border-slate-800 cursor-pointer">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Restaurar desde archivo JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create New Page */}
      {showNewPageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Crear Nueva Página en el Sistema SEO</h3>
              <button
                onClick={() => setShowNewPageModal(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre descriptivo
                </label>
                <input
                  type="text"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  placeholder="ej. Unir PDF"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Ruta / Slug
                </label>
                <input
                  type="text"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value)}
                  placeholder="/unir-pdf/"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewPageModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateNewPage}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                Crear Página
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
