'use client';

import { useState } from 'react';

type SiteConfig = {
  brandName: string;
  siteTitle: string;
  siteDescription: string;
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
};

type ProviderConfig = {
  externalApiUrl: string;
  externalApiKey: string;
  mercadopagoAccessToken: string;
  mercadopagoPublicKey: string;
};

type ServiceItem = {
  id: number;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  externalServiceId: number | null;
  rate: number;
  min: number;
  max: number;
  enabled: boolean;
  fieldsJson: string;
};

export function AdminPanel({
  initialSite,
  initialProvider,
  initialServices,
}: {
  initialSite: SiteConfig;
  initialProvider: ProviderConfig;
  initialServices: ServiceItem[];
}) {
  const [site, setSite] = useState(initialSite);
  const [provider, setProvider] = useState(initialProvider);
  const [services, setServices] = useState(initialServices);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [newService, setNewService] = useState<ServiceItem>({
    id: 0,
    name: '',
    category: '',
    description: '',
    imageUrl: '',
    externalServiceId: null,
    rate: 0,
    min: 1,
    max: 100,
    enabled: true,
    fieldsJson: '["username","link","quantity"]',
  });

  function setLocalMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(''), 2500);
  }

  async function saveSite() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(site),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar site');
      setLocalMessage('Configurações visuais salvas.');
      window.location.reload();
    } catch (error) {
      setLocalMessage(error instanceof Error ? error.message : 'Erro inesperado');
    } finally {
      setSaving(false);
    }
  }

  async function saveProvider() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(provider),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar provedores');
      setLocalMessage('APIs salvas com sucesso.');
    } catch (error) {
      setLocalMessage(error instanceof Error ? error.message : 'Erro inesperado');
    } finally {
      setSaving(false);
    }
  }

  async function createService() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar serviço');

      setServices((prev) => [...prev, data.service]);
      setNewService({
        id: 0,
        name: '',
        category: '',
        description: '',
        imageUrl: '',
        externalServiceId: null,
        rate: 0,
        min: 1,
        max: 100,
        enabled: true,
        fieldsJson: '["username","link","quantity"]',
      });
      setLocalMessage('Serviço criado.');
    } catch (error) {
      setLocalMessage(error instanceof Error ? error.message : 'Erro inesperado');
    } finally {
      setSaving(false);
    }
  }

  async function updateService(service: ServiceItem) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar serviço');

      setServices((prev) => prev.map((item) => (item.id === service.id ? data.service : item)));
      setLocalMessage(`Serviço #${service.id} atualizado.`);
    } catch (error) {
      setLocalMessage(error instanceof Error ? error.message : 'Erro inesperado');
    } finally {
      setSaving(false);
    }
  }

  async function deleteService(id: number) {
    if (!confirm(`Excluir o serviço #${id}?`)) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao excluir serviço');

      setServices((prev) => prev.filter((item) => item.id !== id));
      setLocalMessage(`Serviço #${id} excluído.`);
    } catch (error) {
      setLocalMessage(error instanceof Error ? error.message : 'Erro inesperado');
    } finally {
      setSaving(false);
    }
  }

  function updateServiceLocal(id: number, field: keyof ServiceItem, value: string | number | boolean | null) {
    setServices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  return (
    <div className="space-y">
      {message ? (
        <div className="card" style={{ padding: 14 }}>
          {message}
        </div>
      ) : null}

      <section className="card" style={{ padding: 20 }}>
        <h2>Personalização do site</h2>
        <div className="grid two-col" style={{ marginTop: 16 }}>
          <div>
            <label className="label">Nome da marca</label>
            <input className="input" value={site.brandName} onChange={(e) => setSite({ ...site, brandName: e.target.value })} />
          </div>
          <div>
            <label className="label">Título da aba do navegador</label>
            <input className="input" value={site.siteTitle} onChange={(e) => setSite({ ...site, siteTitle: e.target.value })} />
          </div>
          <div>
            <label className="label">Descrição curta do site</label>
            <input className="input" value={site.siteDescription} onChange={(e) => setSite({ ...site, siteDescription: e.target.value })} />
          </div>
          <div>
            <label className="label">URL da logo</label>
            <input className="input" value={site.logoUrl} onChange={(e) => setSite({ ...site, logoUrl: e.target.value })} />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label className="label">Badge da home</label>
          <input className="input" value={site.heroBadge} onChange={(e) => setSite({ ...site, heroBadge: e.target.value })} />
        </div>

        <div style={{ marginTop: 16 }}>
          <label className="label">Título principal da home</label>
          <input className="input" value={site.heroTitle} onChange={(e) => setSite({ ...site, heroTitle: e.target.value })} />
        </div>

        <div style={{ marginTop: 16 }}>
          <label className="label">Descrição principal da home</label>
          <textarea
            className="input"
            rows={4}
            value={site.heroDescription}
            onChange={(e) => setSite({ ...site, heroDescription: e.target.value })}
          />
        </div>

        <div className="grid catalog" style={{ marginTop: 16 }}>
          {[
            ['Cor primária', 'primaryColor'],
            ['Cor secundária', 'secondaryColor'],
            ['Cor dos botões', 'accentColor'],
            ['Fundo geral', 'backgroundColor'],
            ['Fundo dos cards', 'cardColor'],
            ['Cor do texto', 'textColor'],
          ].map(([label, key]) => (
            <div key={key} className="card" style={{ padding: 16 }}>
              <label className="label">{label}</label>
              <input
                className="input"
                value={site[key as keyof SiteConfig] as string}
                onChange={(e) => setSite({ ...site, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>

        <button className="button primary" style={{ marginTop: 18 }} onClick={saveSite} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar personalização'}
        </button>
      </section>

      <section className="card" style={{ padding: 20 }}>
        <h2>Painel de APIs</h2>
        <div className="grid two-col" style={{ marginTop: 16 }}>
          <div>
            <label className="label">URL da API externa</label>
            <input className="input" value={provider.externalApiUrl} onChange={(e) => setProvider({ ...provider, externalApiUrl: e.target.value })} />
          </div>
          <div>
            <label className="label">Chave da API externa</label>
            <input className="input" value={provider.externalApiKey} onChange={(e) => setProvider({ ...provider, externalApiKey: e.target.value })} />
          </div>
          <div>
            <label className="label">Access Token Mercado Pago</label>
            <input className="input" value={provider.mercadopagoAccessToken} onChange={(e) => setProvider({ ...provider, mercadopagoAccessToken: e.target.value })} />
          </div>
          <div>
            <label className="label">Public Key Mercado Pago</label>
            <input className="input" value={provider.mercadopagoPublicKey} onChange={(e) => setProvider({ ...provider, mercadopagoPublicKey: e.target.value })} />
          </div>
        </div>

        <button className="button primary" style={{ marginTop: 18 }} onClick={saveProvider} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar APIs'}
        </button>
      </section>

      <section className="card" style={{ padding: 20 }}>
        <h2>Criar novo serviço</h2>
        <div className="grid two-col" style={{ marginTop: 16 }}>
          <div>
            <label className="label">Nome</label>
            <input className="input" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Categoria</label>
            <input className="input" value={newService.category} onChange={(e) => setNewService({ ...newService, category: e.target.value })} />
          </div>
          <div>
            <label className="label">Preço</label>
            <input className="input" type="number" step="0.01" value={newService.rate} onChange={(e) => setNewService({ ...newService, rate: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">ID externo</label>
            <input className="input" type="number" value={newService.externalServiceId ?? ''} onChange={(e) => setNewService({ ...newService, externalServiceId: e.target.value ? Number(e.target.value) : null })} />
          </div>
          <div>
            <label className="label">Mínimo</label>
            <input className="input" type="number" value={newService.min} onChange={(e) => setNewService({ ...newService, min: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">Máximo</label>
            <input className="input" type="number" value={newService.max} onChange={(e) => setNewService({ ...newService, max: Number(e.target.value) })} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Descrição</label>
            <textarea className="input" rows={3} value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">URL da imagem</label>
            <input className="input" value={newService.imageUrl} onChange={(e) => setNewService({ ...newService, imageUrl: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Campos do formulário (JSON)</label>
            <input className="input" value={newService.fieldsJson} onChange={(e) => setNewService({ ...newService, fieldsJson: e.target.value })} />
          </div>
        </div>

        <button className="button primary" style={{ marginTop: 18 }} onClick={createService} disabled={saving}>
          {saving ? 'Criando...' : 'Criar serviço'}
        </button>
      </section>

      <section className="card" style={{ padding: 20 }}>
        <h2>Editar catálogo</h2>

        <div className="space-y" style={{ marginTop: 16 }}>
          {services.map((service) => (
            <div key={service.id} className="card" style={{ padding: 18 }}>
              <div className="grid two-col">
                <div>
                  <label className="label">Nome</label>
                  <input className="input" value={service.name} onChange={(e) => updateServiceLocal(service.id, 'name', e.target.value)} />
                </div>
                <div>
                  <label className="label">Categoria</label>
                  <input className="input" value={service.category} onChange={(e) => updateServiceLocal(service.id, 'category', e.target.value)} />
                </div>
                <div>
                  <label className="label">Preço</label>
                  <input className="input" type="number" step="0.01" value={service.rate} onChange={(e) => updateServiceLocal(service.id, 'rate', Number(e.target.value))} />
                </div>
                <div>
                  <label className="label">ID externo</label>
                  <input className="input" type="number" value={service.externalServiceId ?? ''} onChange={(e) => updateServiceLocal(service.id, 'externalServiceId', e.target.value ? Number(e.target.value) : null)} />
                </div>
                <div>
                  <label className="label">Mínimo</label>
                  <input className="input" type="number" value={service.min} onChange={(e) => updateServiceLocal(service.id, 'min', Number(e.target.value))} />
                </div>
                <div>
                  <label className="label">Máximo</label>
                  <input className="input" type="number" value={service.max} onChange={(e) => updateServiceLocal(service.id, 'max', Number(e.target.value))} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="label">Descrição</label>
                  <textarea className="input" rows={3} value={service.description} onChange={(e) => updateServiceLocal(service.id, 'description', e.target.value)} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="label">URL da imagem</label>
                  <input className="input" value={service.imageUrl || ''} onChange={(e) => updateServiceLocal(service.id, 'imageUrl', e.target.value)} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="label">Campos do formulário (JSON)</label>
                  <input className="input" value={service.fieldsJson} onChange={(e) => updateServiceLocal(service.id, 'fieldsJson', e.target.value)} />
                </div>
                <div>
                  <label className="label">Ativo</label>
                  <select className="select" value={service.enabled ? 'true' : 'false'} onChange={(e) => updateServiceLocal(service.id, 'enabled', e.target.value === 'true')}>
                    <option value="true">Ativo</option>
                    <option value="false">Desativado</option>
                  </select>
                </div>
              </div>

              <div className="row" style={{ marginTop: 14 }}>
                <button className="button primary" onClick={() => updateService(service)} disabled={saving}>
                  Salvar serviço
                </button>
                <button className="button secondary" onClick={() => deleteService(service.id)} disabled={saving}>
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}