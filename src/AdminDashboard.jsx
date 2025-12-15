import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'

function AdminDashboard() {
  const navigate = useNavigate()
  const [audits, setAudits] = useState([])
  const [filteredRows, setFilteredRows] = useState([])
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    response: 'all',
    matricule: '',
    questionSearch: ''
  })

  // EXACT SAME THEMES ARRAY AS IN AuditForm.jsx – MUST BE IDENTICAL!
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

  useEffect(() => {
    fetchAudits()
  }, [])

  const fetchAudits = async () => {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .order('audit_date', { ascending: false })

    if (error) {
      console.error('Error fetching audits:', error)
      return
    }

    setAudits(data || [])
    flattenAndFilter(data || [], filters)
  }

  const flattenAndFilter = (auditsData, currentFilters) => {
    const rows = []

    auditsData.forEach(audit => {
      themes.forEach((theme, tIdx) => {
        theme.questions.forEach((question, qIdx) => {
          const key = `t${tIdx}q${qIdx}`
          const resp = audit.responses?.[key] || { answer: '', comment: '', photo: null }

          rows.push({
            date: audit.audit_date || '',
            usine: audit.usine || '',
            auditor: audit.auditor_name || '',
            matricule: audit.auditor_matricule || '',
            theme: theme.title,
            question: question,
            response: resp.answer === 'oui' ? 'Oui' :
                      resp.answer === 'non' ? 'Non' :
                      resp.answer === 'na' ? 'Non Applicable' : '',
            comment: resp.comment || '',
            photo: resp.photo || ''
          })
        })
      })
    })

    // Apply filters
    let filtered = rows
    if (currentFilters.startDate) filtered = filtered.filter(r => r.date >= currentFilters.startDate)
    if (currentFilters.endDate) filtered = filtered.filter(r => r.date <= currentFilters.endDate)
    if (currentFilters.response !== 'all') filtered = filtered.filter(r => r.response === currentFilters.response)
    if (currentFilters.matricule) filtered = filtered.filter(r => r.matricule.toLowerCase().includes(currentFilters.matricule.toLowerCase()))
    if (currentFilters.questionSearch) filtered = filtered.filter(r => r.question.toLowerCase().includes(currentFilters.questionSearch.toLowerCase()))

    setFilteredRows(filtered)
  }

  useEffect(() => {
    flattenAndFilter(audits, filters)
  }, [filters, audits])

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredRows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'HSE Audits')
    XLSX.writeFile(wb, `HSE_Audits_${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const globalStats = {
    totalAudits: audits.length,
    avgCompliance: audits.length ? Math.round(audits.reduce((sum, a) => sum + (a.compliance_rate || 0), 0) / audits.length) : 0,
    totalOK: filteredRows.filter(r => r.response === 'Oui').length,
    totalNonOK: filteredRows.filter(r => r.response === 'Non').length,
    totalNA: filteredRows.filter(r => r.response === 'Non Applicable').length
  }

  return (
    <div style={{ padding: '40px', background: '#f7fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div className="dashboard-header">
          <div className="logo-section">
            <img 
              src="https://3dologie.com/wp-content/uploads/2024/07/WKW-Automotive-Logo.png" 
              alt="WKW Automotive Logo" 
              className="app-logo" 
            />
            <h1 className="logo-title">HSE Admin Dashboard</h1>
          </div>
          <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px' }}>
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <h3>Total Audits</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e3c72' }}>{globalStats.totalAudits}</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <h3>Avg Compliance</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#48bb78' }}>{globalStats.avgCompliance}%</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <h3>OK</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#48bb78' }}>{globalStats.totalOK}</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <h3>Non-OK</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#e53e3e' }}>{globalStats.totalNonOK}</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <h3>Non Applicable</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#718096' }}>{globalStats.totalNA}</p>
          </div>
        </div>

        {/* Filters & Export */}
        <div style={{ padding: '20px', background: 'white', borderRadius: '12px', marginBottom: '30px' }}>
          <h3>Filtres</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
            <input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
            <select value={filters.response} onChange={e => setFilters({...filters, response: e.target.value})}>
              <option value="all">Toutes réponses</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
              <option value="Non Applicable">Non Applicable</option>
            </select>
            <input type="text" placeholder="Matricule" value={filters.matricule} onChange={e => setFilters({...filters, matricule: e.target.value})} />
            <input type="text" placeholder="Rechercher question" value={filters.questionSearch} onChange={e => setFilters({...filters, questionSearch: e.target.value})} />
          </div>
          <button onClick={exportToExcel} style={{ marginTop: '20px', padding: '12px 24px', background: '#28a745', color: 'white', border: 'none', borderRadius: '8px' }}>
            📊 Export to Excel
          </button>
        </div>

        {/* Detailed Table */}
        <h2>Détail des Réponses ({filteredRows.length} lignes)</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', background: 'white', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#1e3c72', color: 'white' }}>
              <tr>
                <th style={{ padding: '15px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Usine</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Auditeur</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Matricule</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Thème</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Question</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Réponse</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Commentaire</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Photo</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    Aucune donnée correspondante. Essayez de modifier les filtres ou soumettez un nouvel audit.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{row.date}</td>
                    <td style={{ padding: '12px' }}>{row.usine}</td>
                    <td style={{ padding: '12px' }}>{row.auditor}</td>
                    <td style={{ padding: '12px' }}>{row.matricule}</td>
                    <td style={{ padding: '12px' }}>{row.theme}</td>
                    <td style={{ padding: '12px' }}>{row.question}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: row.response === 'Oui' ? '#48bb78' : row.response === 'Non' ? '#e53e3e' : '#718096' }}>
                      {row.response}
                    </td>
                    <td style={{ padding: '12px', maxWidth: '300px', wordBreak: 'break-word' }}>{row.comment}</td>
                    <td style={{ padding: '12px' }}>
                      {row.photo ? (
                        <a href={row.photo} target="_blank" rel="noopener noreferrer" style={{ color: '#1e3c72' }}>
                          Voir Photo
                        </a>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <a href="/form" style={{ display: 'inline-block', marginTop: '40px', padding: '12px 24px', background: '#1e3c72', color: 'white', textDecoration: 'none', borderRadius: '8px' }}>
          + New Audit (Admin)
        </a>
      </div>
    </div>
  )
}

export default AdminDashboard