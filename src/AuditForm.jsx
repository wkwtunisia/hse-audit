import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { useNavigate } from 'react-router-dom'

function AuditForm() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    audit_date: new Date().toISOString().split('T')[0],
    usine: 'P',
    auditor_name: '',
    auditor_matricule: '',
    responses: {}
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
        setForm(prev => ({
          ...prev,
          auditor_name: user.email.split('@')[0] || '',
        }))
      } else {
        navigate('/')
      }
    })
  }, [navigate])

  const themes = [
    {
      title: "GENERALITE- SITES/ SERVICES/ ILOTS",
      questions: [
        "Les sols ne sont pas glissants ou mouillés et il n'y a pas de déversement",
        "La zone n'est pas bondée",
        "Les matériaux sont rangés de manière ordonnée et sûre",
        "Les étagères de stockage ne sont chargées que jusqu'à leurs capacité",
        "Les objets lourds et volumineux sont stockés sur des étagères à hauteur de la taille",
        "Les articles ne sont pas placés ou rangés de manière à créer un risque de trébuchement",
        "L'article est sûr (pas d'arêtes vives, conçu pour cet usage)",
        "Les articles les plus lourds sont rangés dans les tiroirs les plus bas",
        "Les zones désignées comme des allées sont bien marquées et visibles",
        "Toutes les portes sont exemptes de débris, de matériaux ou d'équipement",
        "Eclairage de l'espace est adéquat",
        "Vérifier la conformité des fins de travaux",
        "Respect l'interdiction de fumer et manger",
        "Propreté de la zone de travail"
      ]
    },
    {
      title: "MESURES D'URGENCE",
      questions: [
        "L'emplacement de tous les extincteurs sont clairement indiqué",
        "Tous les extincteurs sont correctement fixés au mur",
        "Tous les extincteurs ont été inspectés par des professionnels",
        "Les personnes au poste sont formées sur les réactions en cas d'urgence (déversement ; incendie)",
        "Les sorties de secours sont clairement indiquées",
        "Les détecteurs de fumée sont en bon état de fonctionnement",
        "Il y a un chemin dégagé pour atteindre le matériel d'incendie",
        "Des trousses de premier secours sont disponibles et stockées",
        "Les fiches de données sécurité machines sont affichées sur les postes de travail"
      ]
    },
    {
      title: "SECURITE GENERALE",
      questions: [
        "Les matériaux inflammables sont placés dans les endroits appropriés",
        "Les matériaux chimiques/réactifs sont placés dans les endroits appropriés",
        "Moyens automatiques d'arrêt machine à la limite des charges existants et fonctionnels (risque explosion)",
        "Les moyens de lutte contre l'incendie sont suffisants",
        "Le système de détection d'incendie est conforme à la réglementation",
        "Le nombre des issues de secours est suffisant"
      ]
    },
    {
      title: "SANTE PROFESSIONNELLE",
      questions: [
        "La manipulation des matériaux toxiques répond à la FDS",
        "Le niveau de bruit est-il supérieur à 85 dB?",
        "Les extracteurs de fumée sont activés",
        "Les instructions sanitaires sont affichées sur le lieu de travail",
        "Le risque de chute en hauteur est maîtrisé",
        "Les équipements de sécurité au poste de travail sont suffisants",
        "La manutention manuelle de charge >15 kg est maîtrisée",
        "La manipulation d'outils lourds est maîtrisée",
        "Le risque au travail debout permanent est maîtrisé"
      ]
    },
    {
      title: "MACHINE",
      questions: [
        "Les endroits dangereux de la machine sont protégés par les caches appropriées",
        "La machine est bien fixée (pas de risque de chute)",
        "Les barrières de sécurité sont fonctionnelles et efficaces",
        "Les boutons d'arrêt d'urgence et de stop sont fonctionnels",
        "Les armoires électriques sont fermées, et pas de risque",
        "Les câbles et les prises électriques sont en bon état ? (absence d'un branchement à risque)"
      ]
    },
    {
      title: "SUBSTANCES DANGEREUSES",
      questions: [
        "Les substances dangereuses sont bien étiquetées",
        "Présence des FDS produits chimiques sur la ligne",
        "Les utilisateurs sont formés à la manipulation des produits en toute sécurité"
      ]
    },
    {
      title: "EQUIPEMENTS DE PROTECTION INDVIDUELS EPI",
      questions: [
        "Les opérateurs portent les EPI désignés sur la fiche sécurité au poste",
        "Les opérateurs savent comment utiliser les EPI",
        "Les EPI désignés au poste répondent au besoin"
      ]
    },
    {
      title: "EQUIPEMENTS DE PROTECTION COLLECTIVES",
      questions: [
        "Les équipements de protection collective sont suffisants",
        "Les personnels de poste sont formés à l'utilisation des équipements de protection collectives"
      ]
    },
    {
      title: "ELECTRICITE",
      questions: [
        "Les cordons, fils ou câbles électriques ne sont pas endommagés",
        "Tous les cordons électriques sont correctement fixés",
        "Les cordons électriques présentent un risque de trébuchement",
        "Les prises de courant et des interrupteurs sont en bon état de fonctionnement et de condition"
      ]
    },
    {
      title: "ENERGIE",
      questions: [
        "Présence de fuite d'air comprimé, fissure de tuyaux, etc",
        "Respect de l'arrêt des équipements en période d'inoccupation (poste galion, poste de contrôle, etc)",
        "Le système d'éclairage répond à la stratégie de l'entreprise",
        "La maintenance préventive niv 1, niv 2 et curative sont réalisées"
      ]
    },
    {
      title: "ENVIRONNEMENT",
      questions: [
        "Le tri sélectif à la source est respecté",
        "L'accès aux zones de stockage des déchets est limité",
        "Les instructions de gestion des déchets sont affichées"
      ]
    }
  ]

  const handleResponseChange = (themeIndex, qIndex, value) => {
    const key = `t${themeIndex}q${qIndex}`
    setForm(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [key]: {
          answer: value,
          comment: prev.responses[key]?.comment || '',
          photo: prev.responses[key]?.photo || null
        }
      }
    }))
  }

  const handleCommentChange = (key, comment) => {
    setForm(prev => ({
      ...prev,
      responses: { ...prev.responses, [key]: { ...prev.responses[key], comment } }
    }))
  }

  const handlePhotoUpload = async (key, file) => {
    if (!file || !user) return

    const filePath = `${user.id}/${Date.now()}_${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('audit-photos')
      .upload(filePath, file, { upsert: false })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('audit-photos')
      .getPublicUrl(filePath)

    setForm(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [key]: { ...prev.responses[key], photo: publicUrl }
      }
    }))
  }

  const calculateResults = () => {
    let applicable = 0
    let ok = 0
    Object.values(form.responses).forEach(r => {
      if (r.answer && r.answer !== 'na') {
        applicable++
        if (r.answer === 'oui') ok++
      }
    })
    const rate = applicable > 0 ? Math.round((ok / applicable) * 100) : 100
    return { rate, ok, nonOk: applicable - ok, applicable }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    let valid = true
    for (const key in form.responses) {
      if (form.responses[key].answer === 'non' && !form.responses[key].comment.trim()) {
        valid = false
        break
      }
    }
    if (!valid) {
      setMessage('Erreur: Commentaire obligatoire pour chaque "Non"')
      setLoading(false)
      return
    }

    const results = calculateResults()

    const { error } = await supabase.from('audits').insert({
      audit_date: form.audit_date,
      usine: form.usine,
      auditor_name: form.auditor_name,
      auditor_matricule: form.auditor_matricule,
      responses: form.responses,
      compliance_rate: results.rate,
      created_by: user?.id
    })

    if (error) {
      setMessage('Erreur: ' + error.message)
    } else {
      setMessage(`Audit soumis ! Taux de conformité: ${results.rate}%`)
      setTimeout(() => navigate('/'), 2000)  // Back to welcome after submit
    }
    setLoading(false)
  }

  const results = calculateResults()

  return (
    <div style={{ padding: '20px', background: '#f7fafc', minHeight: '100vh' }}>
      <div className="login-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="page-header">
          <img 
            src="https://3dologie.com/wp-content/uploads/2024/07/WKW-Automotive-Logo.png" 
            alt="WKW Automotive Logo" 
            className="app-logo" 
          />
          <h1 className="logo-title">Checklist Audit HSE</h1>
        </div>

        {message && <div className={`message ${message.includes('Erreur') ? 'error' : 'success'}`}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="form-group">
              <label>Date d'audit</label>
              <input type="date" value={form.audit_date} onChange={e => setForm({...form, audit_date: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Usine</label>
              <select value={form.usine} onChange={e => setForm({...form, usine: e.target.value})} required>
                <option value="P">P</option>
                <option value="P2">P2</option>
              </select>
            </div>
            <div className="form-group">
              <label>Nom Auditeur</label>
              <input type="text" value={form.auditor_name} onChange={e => setForm({...form, auditor_name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Matricule Auditeur</label>
              <input type="text" value={form.auditor_matricule} onChange={e => setForm({...form, auditor_matricule: e.target.value})} required />
            </div>
          </div>

          {themes.map((theme, tIdx) => (
            <div key={tIdx} style={{ marginBottom: '40px', padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              <h2 style={{ color: '#1e3c72', marginBottom: '20px' }}>{theme.title}</h2>
              {theme.questions.map((q, qIdx) => {
                const key = `t${tIdx}q${qIdx}`
                const resp = form.responses[key] || { answer: '', comment: '', photo: null }
                return (
                  <div key={qIdx} style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                    <p style={{ fontWeight: '600' }}>{q}</p>
                    <div style={{ margin: '10px 0' }}>
                      <label style={{ marginRight: '20px' }}>
                        <input type="radio" checked={resp.answer === 'oui'} onChange={() => handleResponseChange(tIdx, qIdx, 'oui')} /> Oui
                      </label>
                      <label style={{ marginRight: '20px' }}>
                        <input type="radio" checked={resp.answer === 'non'} onChange={() => handleResponseChange(tIdx, qIdx, 'non')} /> Non
                      </label>
                      <label>
                        <input type="radio" checked={resp.answer === 'na'} onChange={() => handleResponseChange(tIdx, qIdx, 'na')} /> Non Applicable
                      </label>
                    </div>

                    {resp.answer === 'non' && (
                      <>
                        <textarea
                          placeholder="Commentaire obligatoire..."
                          value={resp.comment}
                          onChange={e => handleCommentChange(key, e.target.value)}
                          rows="3"
                          style={{ width: '100%', marginBottom: '10px' }}
                          required
                        />
                        <input type="file" accept="image/*" onChange={e => handlePhotoUpload(key, e.target.files[0])} />
                        {resp.photo && <img src={resp.photo} alt="Photo" style={{ maxWidth: '400px', marginTop: '10px', borderRadius: '8px', display: 'block' }} />}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          <div style={{ padding: '30px', background: '#e6fffa', borderRadius: '12px', textAlign: 'center', margin: '40px 0' }}>
            <h2>Résultat de l'Audit</h2>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: results.rate >= 90 ? '#48bb78' : results.rate >= 70 ? '#3182ce' : '#e53e3e' }}>
              Taux de conformité: {results.rate}%
            </p>
            <p>OK: {results.ok} | Non-OK: {results.nonOk} | Applicable: {results.applicable}</p>
          </div>

          <button type="submit" disabled={loading} className="login-btn" style={{ width: '100%', padding: '16px', fontSize: '18px' }}>
            {loading ? 'Soumission en cours...' : 'Soumettre l\'Audit'}
          </button>
        </form>

        <p className="footer-text" style={{ marginTop: '30px', textAlign: 'center' }}>
          <a href="/" style={{ color: '#1e3c72' }}>Retour</a> | Health, Safety & Environment Audit System
        </p>
      </div>
    </div>
  )
}

export default AuditForm