'use client';

import { useState } from 'react';
import AdminHeader from '../_components/AdminHeader';
import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { Input, Textarea } from '@/app/_components/ui/Input';
import { Avatar } from '@/app/_components/ui/Avatar';
import { Badge } from '@/app/_components/ui/Badge';
import { 
  Globe, Share2, Bot, MessageSquare, 
  Settings, CheckCircle2, AlertCircle, Save,
  ToggleLeft, ToggleRight, Clock
} from 'lucide-react';

export default function MetaIntegrationPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const [isBotActive, setIsBotActive] = useState(true);
  const [greeting, setGreeting] = useState('Merhaba, Özel Medikum Hastanesine hoş geldiniz. Size yapay zeka asistanımız Meliha yanıt veriyor. Nasıl yardımcı olabilirim?');
  const [prompt, setPrompt] = useState('Sen kibar bir sağlık asistanısın. Hastalara tıbbi tavsiye vermezsin, sadece randevu süreçlerinde yardımcı olur ve genel bilgiler verirsin. Eğer kişi şikayetini yazarsa, onu ilgili bölüme veya doktorlara yönlendirirsin. Asla fiyat bilgisi paylaşma, hastaneyi aramalarını öner.');

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate OAuth flow
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AdminHeader title="Meta Entegrasyonu" subtitle="Instagram ve Facebook mesaj yönetimi" />
      
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="max-w-5xl mx-auto w-full">
          {!isConnected ? (
            <div className="flex items-center justify-center min-h-[400px] animate-fade-in">
              <Card className="max-w-md w-full p-8 text-center bg-gradient-to-br from-[var(--color-bg-surface)] to-[var(--color-bg-elevated)] border border-[var(--color-border)] shadow-xl shadow-blue-500/5">
                <div className="flex justify-center items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
                    <Share2 size={32} className="text-white" />
                  </div>
                  <div className="text-[var(--color-text-muted)] opacity-50 text-xl font-light">+</div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-[var(--shadow-glow-primary)]">
                    <Bot size={32} className="text-white" />
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Meta Hesabınızı Bağlayın</h2>
                <p className="text-sm text-[var(--color-text-muted)] mb-8 leading-relaxed px-2">
                  Instagram DM ve Messenger kutunuzu yapay zekaya emanet edin. Yetki vermek için aşağıdaki butona tıklayarak devam edin.
                </p>
                
                <Button 
                  fullWidth 
                  size="lg" 
                  onClick={handleConnect} 
                  disabled={isConnecting}
                  icon={isConnecting ? undefined : <Globe size={18} />}
                  className="bg-[#0866FF] hover:bg-[#0759DF] text-white border-none shadow-blue-600/30 shadow-lg h-12 rounded-xl transition-all active:scale-[0.98]"
                >
                  {isConnecting ? 'Bağlanıyor...' : 'Facebook ile Devam Et'}
                </Button>
                
                <p className="text-xs text-[var(--color-text-muted)] mt-5 flex items-center justify-center gap-1.5 opacity-70">
                  <AlertCircle size={12} /> Sadece mesaj okuma ve gönderme izni istenir.
                </p>
              </Card>
            </div>
          ) : (
            <div className="space-y-6 animate-slide-up">
              {/* Connected Status Banner */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-success-muted)] border border-[var(--color-success)]/10 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar firstName="Özel" lastName="Medikum" size="md" online />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border-2 border-[var(--color-bg-base)]">
                      <CheckCircle2 size={10} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[var(--color-success)] uppercase tracking-wider">Bağlantı Aktif</p>
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      Instagram: <span className="text-[var(--color-text-primary)] font-semibold">@ozelmedikum</span> bağlı.
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-[var(--color-error)] hover:bg-[var(--color-error-muted)] rounded-xl px-4" onClick={() => setIsConnected(false)}>
                  Bağlantıyı Kes
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bot Settings */}
                <Card className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-muted)] flex items-center justify-center">
                        <Settings size={16} className="text-[var(--color-primary)]" />
                      </div>
                      <h3 className="text-base font-bold text-[var(--color-text-primary)]">Bot Konfigürasyonu</h3>
                    </div>
                    {/* Custom Toggle Switch */}
                    <button 
                      onClick={() => setIsBotActive(!isBotActive)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--color-primary)] transition-all active:scale-[0.95]"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-tight text-[var(--color-text-muted)]">Bot Durumu</span>
                      {isBotActive ? (
                        <ToggleRight size={22} className="text-emerald-500" />
                      ) : (
                        <ToggleLeft size={22} className="text-[var(--color-text-muted)]" />
                      )}
                    </button>
                  </div>

                  <div className={`space-y-6 flex-1 transition-all duration-300 ${!isBotActive ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                    <Input 
                      label="Kullanıcı Karşılama Mesajı"
                      value={greeting}
                      onChange={(e) => setGreeting(e.target.value)}
                      placeholder="Hastaya ilk atılacak mesaj..."
                      hint="Kullanıcı ilk mesajı attığında tetiklenir."
                    />
                    
                    <Textarea
                      label="Bot Karakteri ve Kuralları (System Prompt)"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={8}
                      placeholder="Örn: Sen kibar bir sağlık asistanısın..."
                      hint="AI modelinin hastalarla konuşma stilini ve sınırlarını belirler."
                    />

                    <Button 
                      fullWidth 
                      size="lg"
                      icon={<Save size={16} />}
                      onClick={() => alert('Ayarlar başarıyla kaydedildi.')}
                      className="shadow-lg shadow-[var(--color-primary)]/10"
                    >
                      Ayarları Güncelle
                    </Button>
                  </div>
                </Card>

                {/* Inbox Logs Preview */}
                <Card className="flex flex-col h-full bg-[var(--color-bg-surface)]">
                  <div className="p-5 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-secondary-muted)] flex items-center justify-center">
                        <MessageSquare size={16} className="text-[var(--color-secondary)]" />
                      </div>
                      <h3 className="text-base font-bold text-[var(--color-text-primary)]">Sohbet Logları</h3>
                    </div>
                    <Badge variant="secondary" size="xs" className="px-2 animate-pulse bg-emerald-500/10 text-emerald-500 border-emerald-500/20">CANLI</Badge>
                  </div>
                  
                  <div className="flex-1 p-5 overflow-y-auto space-y-5 max-h-[500px] bg-[var(--color-bg-elevated)]/30">
                    {/* Mock Chat 1 */}
                    <div className="group space-y-3 animate-fade-in">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-[var(--color-text-muted)]">@ahmet123 — Instagram</span>
                        <span className="text-[var(--color-text-muted)] opacity-60">10:42</span>
                      </div>
                      <div className="bg-[var(--color-bg-surface)] p-3 rounded-2xl rounded-tl-none border border-[var(--color-border-subtle)] shadow-sm">
                        <p className="text-sm text-[var(--color-text-secondary)]">Kardiyoloji muayene ücreti ne kadar?</p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1.5">
                          <Bot size={11} className="text-[var(--color-primary)]" />
                          <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-tighter">AI Asistan Yanıtı</span>
                        </div>
                        <div className="bg-[var(--color-primary-muted)] p-3 rounded-2xl rounded-tr-none border border-[var(--color-primary)]/10 text-right max-w-[90%]">
                          <p className="text-sm text-[var(--color-text-primary)] leading-relaxed italic opacity-90">
                            &quot;Merhaba Ahmet Bey. Ücret bilgisi paylaşamıyorum, ancak 0212 555 0100 numarasından veya web sitemizden randevu alarak detaylara ulaşabilirsiniz.&quot;
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="divider" />

                    {/* Mock Chat 2 */}
                    <div className="group space-y-3 animate-fade-in delay-150">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-[var(--color-text-muted)]">@aysearikan — Instagram</span>
                        <span className="text-[var(--color-text-muted)] opacity-60">09:15</span>
                      </div>
                      <div className="bg-[var(--color-bg-surface)] p-3 rounded-2xl rounded-tl-none border border-[var(--color-border-subtle)] shadow-sm">
                        <p className="text-sm text-[var(--color-text-secondary)]">Dün randevu almıştım, nasıl iptal edebilirim?</p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1.5">
                          <Bot size={11} className="text-[var(--color-primary)]" />
                          <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-tighter">AI Asistan Yanıtı</span>
                        </div>
                        <div className="bg-[var(--color-primary-muted)] p-3 rounded-2xl rounded-tr-none border border-[var(--color-primary)]/10 text-right max-w-[90%]">
                          <p className="text-sm text-[var(--color-text-primary)] leading-relaxed italic opacity-90">
                            &quot;Merhaba Ayşe Hanım, sitemizdeki &apos;Hasta Portalı&apos; üzerinden giriş yaparak &apos;Randevularım&apos; sekmesinden işleminizi gerçekleştirebilirsiniz.&quot;
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-[var(--color-bg-surface)] border-t border-[var(--color-border-subtle)]">
                    <Button variant="ghost" fullWidth size="sm" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
                      Tüm Konuşmaları İncele (Meta Business Suite) ↗
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
