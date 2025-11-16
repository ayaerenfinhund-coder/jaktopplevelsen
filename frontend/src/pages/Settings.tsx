import { useState } from 'react';
import {
  User,
  Bell,
  Palette,
  Database,
  Shield,
  RefreshCw,
  Download,
  Trash2,
  Save,
} from 'lucide-react';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Profilinnstillinger
  const [name, setName] = useState('Ola Nordmann');
  const [email, setEmail] = useState('ola@eksempel.no');

  // App-innstillinger
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('no');
  const [units, setUnits] = useState('metric');
  const [mapStyle, setMapStyle] = useState('terrain');

  // Varsler
  const [emailSummary, setEmailSummary] = useState(true);
  const [newTrackNotification, setNewTrackNotification] = useState(true);
  const [backupReminder, setBackupReminder] = useState(true);

  // Garmin
  const [garminEmail, setGarminEmail] = useState('');
  const [garminPassword, setGarminPassword] = useState('');
  const [autoSync, setAutoSync] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Innstillinger lagret!');
    } catch (error) {
      toast.error('Kunne ikke lagre innstillinger');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    toast.success('Eksport startet! Du vil motta en e-post når den er klar.');
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        'Er du sikker på at du vil slette kontoen din? Dette kan ikke angres!'
      )
    ) {
      toast.error('Kontosletting er deaktivert i denne demoen');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'appearance', label: 'Utseende', icon: Palette },
    { id: 'notifications', label: 'Varsler', icon: Bell },
    { id: 'garmin', label: 'Garmin', icon: RefreshCw },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'security', label: 'Sikkerhet', icon: Shield },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Innstillinger</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidemeny */}
        <nav className="lg:w-64 flex-shrink-0">
          <ul className="space-y-1">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeTab === tab.id
                      ? 'bg-primary-700/20 text-primary-400'
                      : 'text-text-secondary hover:bg-background-light'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Innhold */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="card p-6 space-y-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Profilinformasjon
              </h2>

              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-primary-700 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                  {name.charAt(0)}
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    Last opp bilde
                  </Button>
                  <p className="text-sm text-text-muted mt-2">
                    JPG, PNG eller WebP. Maks 5MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Navn</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">E-post</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    disabled
                  />
                  <p className="input-helper">E-post kan ikke endres</p>
                </div>
              </div>

              <div className="pt-4 border-t border-background-lighter">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  isLoading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Lagre endringer
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="card p-6 space-y-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Utseende og tilpasning
              </h2>

              <div>
                <label className="input-label">Tema</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-lg border text-center transition-colors ${
                      theme === 'light'
                        ? 'border-primary-500 bg-primary-700/20'
                        : 'border-background-lighter hover:border-primary-700/50'
                    }`}
                  >
                    <div className="w-12 h-12 bg-white rounded-lg mx-auto mb-2" />
                    <span className="text-text-primary">Lys</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-lg border text-center transition-colors ${
                      theme === 'dark'
                        ? 'border-primary-500 bg-primary-700/20'
                        : 'border-background-lighter hover:border-primary-700/50'
                    }`}
                  >
                    <div className="w-12 h-12 bg-background rounded-lg mx-auto mb-2" />
                    <span className="text-text-primary">Mørk</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="input-label">Språk</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="select"
                >
                  <option value="no">Norsk</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="input-label">Måleenheter</label>
                <select
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="select"
                >
                  <option value="metric">Metrisk (km, m, °C)</option>
                  <option value="imperial">Imperial (mi, ft, °F)</option>
                </select>
              </div>

              <div>
                <label className="input-label">Kartstil</label>
                <select
                  value={mapStyle}
                  onChange={(e) => setMapStyle(e.target.value)}
                  className="select"
                >
                  <option value="terrain">Terreng</option>
                  <option value="satellite">Satellitt</option>
                  <option value="standard">Standard</option>
                </select>
              </div>

              <div className="pt-4 border-t border-background-lighter">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  isLoading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Lagre endringer
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card p-6 space-y-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Varslingsinnstillinger
              </h2>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-background rounded-lg">
                  <div>
                    <p className="font-medium text-text-primary">
                      Ukentlig e-postsammendrag
                    </p>
                    <p className="text-sm text-text-muted">
                      Motta et sammendrag av ukens jaktturer
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailSummary}
                    onChange={(e) => setEmailSummary(e.target.checked)}
                    className="checkbox"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-background rounded-lg">
                  <div>
                    <p className="font-medium text-text-primary">
                      Nye spor importert
                    </p>
                    <p className="text-sm text-text-muted">
                      Varsle når nye spor fra Garmin er importert
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={newTrackNotification}
                    onChange={(e) => setNewTrackNotification(e.target.checked)}
                    className="checkbox"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-background rounded-lg">
                  <div>
                    <p className="font-medium text-text-primary">
                      Sikkerhetskopi-påminnelse
                    </p>
                    <p className="text-sm text-text-muted">
                      Påminn om å ta sikkerhetskopi av data
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={backupReminder}
                    onChange={(e) => setBackupReminder(e.target.checked)}
                    className="checkbox"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-background-lighter">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  isLoading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Lagre endringer
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'garmin' && (
            <div className="card p-6 space-y-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Garmin Connect-integrasjon
              </h2>

              <div className="p-4 bg-background rounded-lg">
                <p className="text-text-secondary mb-4">
                  Koble til Garmin Connect for automatisk synkronisering av spor
                  fra Alpha 200-enheten din.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="input-label">Garmin Connect e-post</label>
                    <input
                      type="email"
                      value={garminEmail}
                      onChange={(e) => setGarminEmail(e.target.value)}
                      placeholder="din@garmin-epost.no"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="input-label">Garmin Connect passord</label>
                    <input
                      type="password"
                      value={garminPassword}
                      onChange={(e) => setGarminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input"
                    />
                    <p className="input-helper">
                      Passordet lagres kryptert og brukes kun for synkronisering
                    </p>
                  </div>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={autoSync}
                      onChange={(e) => setAutoSync(e.target.checked)}
                      className="checkbox"
                    />
                    <span className="text-text-secondary">
                      Automatisk synkronisering (sjekk for nye spor daglig)
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Synkroniser nå
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  isLoading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Lagre innstillinger
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="card p-6 space-y-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Data og eksport
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-background rounded-lg">
                  <h3 className="font-medium text-text-primary mb-2">
                    Eksporter alle data
                  </h3>
                  <p className="text-sm text-text-muted mb-4">
                    Last ned alle jaktturer, spor og bilder i JSON-format
                  </p>
                  <Button
                    variant="outline"
                    leftIcon={<Download className="w-4 h-4" />}
                    onClick={handleExportData}
                  >
                    Eksporter data
                  </Button>
                </div>

                <div className="p-4 bg-background rounded-lg">
                  <h3 className="font-medium text-text-primary mb-2">
                    Eksporter GPX
                  </h3>
                  <p className="text-sm text-text-muted mb-4">
                    Last ned alle GPS-spor som GPX-filer
                  </p>
                  <Button
                    variant="outline"
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Eksporter GPX
                  </Button>
                </div>

                <div className="p-4 bg-background rounded-lg">
                  <h3 className="font-medium text-text-primary mb-2">
                    Lagringsbruk
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Bilder</span>
                      <span className="text-text-secondary">245 MB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Spor/GPX</span>
                      <span className="text-text-secondary">12 MB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Metadata</span>
                      <span className="text-text-secondary">2 MB</span>
                    </div>
                    <div className="w-full bg-background-lighter rounded-full h-2 mt-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: '26%' }}
                      />
                    </div>
                    <p className="text-xs text-text-muted">
                      259 MB av 1 GB brukt
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card p-6 space-y-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Sikkerhet og konto
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-background rounded-lg">
                  <h3 className="font-medium text-text-primary mb-2">
                    Endre passord
                  </h3>
                  <p className="text-sm text-text-muted mb-4">
                    Oppdater passordet ditt for økt sikkerhet
                  </p>
                  <Button variant="outline">Endre passord</Button>
                </div>

                <div className="p-4 bg-background rounded-lg">
                  <h3 className="font-medium text-text-primary mb-2">
                    To-faktor-autentisering
                  </h3>
                  <p className="text-sm text-text-muted mb-4">
                    Legg til et ekstra lag med sikkerhet
                  </p>
                  <Button variant="outline">Aktiver 2FA</Button>
                </div>

                <div className="p-4 bg-error/10 border border-error/30 rounded-lg">
                  <h3 className="font-medium text-error mb-2">Slett konto</h3>
                  <p className="text-sm text-text-muted mb-4">
                    Permanent slett kontoen din og alle data. Dette kan ikke
                    angres.
                  </p>
                  <Button
                    variant="danger"
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    onClick={handleDeleteAccount}
                  >
                    Slett konto
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
