'use client';

import { useState } from 'react';

export default function ManualPage() {
  const [activeSection, setActiveSection] = useState('download');

  const sections = [
    { id: 'download', label: 'ダウンロード' },
    { id: 'setup', label: '初期セットアップ' },
    { id: 'daily', label: '毎日の使い方' },
    { id: 'order', label: '注文の流れ' },
    { id: 'admin', label: '管理画面' },
    { id: 'trouble', label: '困ったとき' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#12121a' }}>
      {/* ヘッダー */}
      <header
        style={{
          background: '#0a0a0c',
          borderBottom: '1px solid #3a3a4a',
          padding: '40px 24px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* 装飾線 */}
        <div style={{ position: 'absolute', left: '50%', top: 0, width: '1px', height: '20px', background: '#d4af37' }} />

        <div
          style={{
            fontFamily: "'Shippori Mincho', serif",
            fontSize: '11px',
            color: '#d4af37',
            letterSpacing: '0.3em',
            marginBottom: '12px',
          }}
        >
          MANUAL
        </div>
        <h1
          style={{
            fontFamily: "'Shippori Mincho', serif",
            margin: 0,
            fontSize: '28px',
            color: '#f5f0e6',
            letterSpacing: '0.1em',
          }}
        >
          DrinkQR 使い方
        </h1>
        <p style={{ margin: '12px 0 0', color: '#6a6a6a', fontSize: '13px' }}>
          飲み放題QR注文システム
        </p>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
        {/* ナビゲーション */}
        <nav
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '24px',
            borderBottom: '1px solid #2a2a36',
            marginBottom: '32px',
          }}
        >
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                padding: '12px 20px',
                border: activeSection === section.id ? '1px solid #d4af37' : '1px solid #2a2a36',
                background: activeSection === section.id ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                color: activeSection === section.id ? '#d4af37' : '#9a9a9a',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
                fontWeight: activeSection === section.id ? 700 : 400,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ color: '#6a6a6a', marginRight: '8px' }}>{String(index).padStart(2, '0')}</span>
              {section.label}
            </button>
          ))}
        </nav>

        {/* コンテンツ */}
        <main>
          {/* ダウンロード */}
          {activeSection === 'download' && (
            <div>
              <SectionTitle>ダウンロード</SectionTitle>
              <p style={{ marginBottom: '32px', color: '#9a9a9a', fontSize: '14px', lineHeight: 1.8 }}>
                DrinkQRを使うために必要なファイルをダウンロードしてください。
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Web版印刷サーバー */}
                <DownloadCard
                  title="Web版 印刷サーバー"
                  subtitle="推奨 - ダウンロード不要"
                  description="ブラウザだけで動く印刷サーバーです。アプリのダウンロード・インストール不要で、すぐに使えます。"
                  href="/print-server"
                  buttonText="印刷サーバーを開く"
                  note="必要なもの: PC + Chrome/Edge + Bluetooth対応プリンター"
                  featured
                />

                {/* アプリ版 */}
                <div
                  style={{
                    background: '#1c1c26',
                    border: '1px solid #2a2a36',
                    padding: '28px',
                  }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: '#f5f0e6', marginBottom: '4px' }}>
                      アプリ版 印刷サーバー
                    </div>
                    <div style={{ fontSize: '12px', color: '#6a6a6a' }}>USB接続で使う場合</div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#9a9a9a', marginBottom: '20px', lineHeight: 1.7 }}>
                    USB接続でプリンターを使う場合は、こちらのアプリをダウンロードしてください。
                  </p>
                  <details style={{ cursor: 'pointer' }}>
                    <summary
                      style={{
                        padding: '12px 16px',
                        background: '#0a0a0c',
                        border: '1px solid #3a3a4a',
                        fontSize: '13px',
                        color: '#9a9a9a',
                      }}
                    >
                      ダウンロードリンクを表示
                    </summary>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                      <DownloadLink
                        href="https://github.com/yu010101/drinkqr/releases/download/v1.0.0/DrinkQR.-1.0.0-arm64.dmg"
                        label="Mac (Apple Silicon M1/M2/M3)"
                        size="108MB"
                      />
                      <DownloadLink
                        href="https://github.com/yu010101/drinkqr/releases/download/v1.0.0/DrinkQR.-1.0.0.dmg"
                        label="Mac (Intel)"
                        size="112MB"
                      />
                      <DownloadLink
                        href="https://github.com/yu010101/drinkqr/releases/download/v1.0.0/DrinkQR-1.0.0-win.zip"
                        label="Windows (.zip)"
                        size="84MB"
                      />
                    </div>
                  </details>
                </div>

                {/* QRコード */}
                <DownloadCard
                  title="QRコード一覧"
                  subtitle="各テーブル用"
                  description="各テーブルに設置するQRコードです。印刷して、ラミネート加工するのがおすすめです。"
                  href="/qrcodes/index.html"
                  buttonText="QRコード一覧を開く"
                />
              </div>

              <InfoBox style={{ marginTop: '32px' }}>
                ダウンロード後は「初期セットアップ」の手順に従ってインストールしてください。
              </InfoBox>
            </div>
          )}

          {/* 初期セットアップ */}
          {activeSection === 'setup' && (
            <div>
              <SectionTitle>初期セットアップ</SectionTitle>

              <div style={{ marginBottom: '40px' }}>
                <SubTitle>必要なもの</SubTitle>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  {[
                    { name: 'タブレット', desc: '注文確認用（iPad推奨）' },
                    { name: 'PC', desc: '印刷サーバー用' },
                    { name: 'プリンター', desc: 'SII MP-B20' },
                    { name: 'USBケーブル', desc: 'プリンター接続用' },
                  ].map((item) => (
                    <div
                      key={item.name}
                      style={{
                        padding: '20px',
                        background: '#1c1c26',
                        border: '1px solid #2a2a36',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: '4px', color: '#f5f0e6' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#6a6a6a' }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <StepSection title="Step 1: プリンターの接続">
                <ol style={{ lineHeight: 2.2, paddingLeft: '20px', color: '#c5c5c5' }}>
                  <li>プリンター（SII MP-B20）の電源を入れる</li>
                  <li>USBケーブルでPCに接続する</li>
                  <li>
                    PCがプリンターを認識したか確認
                    <ul style={{ fontSize: '13px', color: '#9a9a9a', marginTop: '4px' }}>
                      <li>Mac: システム設定 → プリンタとスキャナ</li>
                      <li>Windows: 設定 → デバイス → プリンター</li>
                    </ul>
                  </li>
                  <li>
                    <strong style={{ color: '#d4af37' }}>デフォルトプリンターに設定する</strong>
                  </li>
                </ol>
              </StepSection>

              <StepSection title="Step 2: 印刷サーバーアプリのインストール">
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '8px', color: '#c5c5c5' }}>Macの場合</div>
                  <ol style={{ lineHeight: 2.2, paddingLeft: '20px', color: '#9a9a9a', fontSize: '14px' }}>
                    <li>「DrinkQR印刷サーバー.dmg」をダブルクリック</li>
                    <li>表示されたウィンドウで、アプリをApplicationsフォルダにドラッグ</li>
                    <li>初回起動時に「開発元が未確認」と出たら：システム設定 → プライバシーとセキュリティ →「このまま開く」</li>
                  </ol>
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '8px', color: '#c5c5c5' }}>Windowsの場合</div>
                  <ol style={{ lineHeight: 2.2, paddingLeft: '20px', color: '#9a9a9a', fontSize: '14px' }}>
                    <li>「DrinkQR印刷サーバー.exe」をダブルクリック</li>
                    <li>「WindowsによってPCが保護されました」と出たら：「詳細情報」→「実行」をクリック</li>
                    <li>インストール不要、すぐに使えます</li>
                  </ol>
                </div>
              </StepSection>

              <StepSection title="Step 3: QRコードの準備">
                <ol style={{ lineHeight: 2.2, paddingLeft: '20px', color: '#c5c5c5' }}>
                  <li>
                    <a href="/qrcodes/index.html" target="_blank" style={{ color: '#d4af37' }}>
                      QRコード一覧ページ
                    </a>
                    を開く
                  </li>
                  <li>ブラウザの印刷機能で印刷（Ctrl+P または Cmd+P）</li>
                  <li>各テーブルにQRコードを設置</li>
                </ol>
                <InfoBox style={{ marginTop: '16px' }}>
                  QRコードはラミネート加工すると長持ちします
                </InfoBox>
              </StepSection>

              <SuccessBox>セットアップ完了！次は「毎日の使い方」を確認してください</SuccessBox>
            </div>
          )}

          {/* 毎日の使い方 */}
          {activeSection === 'daily' && (
            <div>
              <SectionTitle>毎日の使い方</SectionTitle>

              <SubTitle>営業開始時にやること</SubTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
                {[
                  { step: 1, title: 'プリンターの電源を入れる', desc: 'SII MP-B20の電源ボタンを押す' },
                  { step: 2, title: 'PCで印刷サーバーを起動', desc: 'Applicationsフォルダの「DrinkQR印刷サーバー」をダブルクリック' },
                  { step: 3, title: '「接続済み」を確認', desc: 'アプリ画面に「接続済み」と緑色で表示されればOK' },
                  { step: 4, title: 'タブレットで管理画面を開く', desc: 'ブラウザで drinkqr.vercel.app/admin を開く' },
                ].map((item) => (
                  <div
                    key={item.step}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '20px',
                      background: '#1c1c26',
                      border: '1px solid #2a2a36',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        background: '#d4af37',
                        color: '#0a0a0c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '16px',
                        flexShrink: 0,
                      }}
                    >
                      {item.step}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, marginBottom: '4px', color: '#f5f0e6' }}>{item.title}</div>
                      <div style={{ fontSize: '13px', color: '#9a9a9a' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <SubTitle>営業終了時にやること</SubTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { step: 1, title: '印刷サーバーを終了', desc: 'タスクバーのアイコンを右クリック →「終了」' },
                  { step: 2, title: 'プリンターの電源を切る', desc: 'SII MP-B20の電源ボタンを押す' },
                ].map((item) => (
                  <div
                    key={item.step}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '20px',
                      background: '#161620',
                      border: '1px solid #2a2a36',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        border: '1px solid #3a3a4a',
                        color: '#6a6a6a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '16px',
                        flexShrink: 0,
                      }}
                    >
                      {item.step}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, marginBottom: '4px', color: '#c5c5c5' }}>{item.title}</div>
                      <div style={{ fontSize: '13px', color: '#6a6a6a' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 注文の流れ */}
          {activeSection === 'order' && (
            <div>
              <SectionTitle>注文の流れ</SectionTitle>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {[
                  { title: 'お客様がQRコードをスキャン', desc: 'スマホのカメラでテーブルのQRコードを読み取る' },
                  { title: 'ドリンクを選んで注文', desc: '＋ボタンで数量を選び「注文する」をタップ' },
                  { title: '注文完了画面が表示', desc: 'お客様のスマホに注文番号と内容が表示される' },
                  { title: '自動で注文票が印刷される', desc: '厨房のプリンターから注文票が出てくる' },
                  { title: 'ドリンクを作って提供', desc: '注文票を見てドリンクを準備、お客様に提供' },
                ].map((item, index) => (
                  <div key={index}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        padding: '24px',
                      }}
                    >
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          background: index === 3 ? '#d4af37' : 'transparent',
                          border: index === 3 ? 'none' : '2px solid #3a3a4a',
                          color: index === 3 ? '#0a0a0c' : '#d4af37',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: "'Shippori Mincho', serif",
                          fontWeight: 700,
                          fontSize: '18px',
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px', color: '#f5f0e6' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '13px', color: '#9a9a9a' }}>{item.desc}</div>
                      </div>
                    </div>
                    {index < 4 && (
                      <div
                        style={{
                          width: '2px',
                          height: '24px',
                          background: '#2a2a36',
                          marginLeft: '47px',
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '40px' }}>
                <SubTitle>印刷される注文票のイメージ</SubTitle>
                <div
                  style={{
                    background: '#fff',
                    color: '#000',
                    padding: '20px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    maxWidth: '250px',
                    border: '1px solid #3a3a4a',
                  }}
                >
                  <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '10px' }}>【注文票】</div>
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      border: '2px solid black',
                      padding: '10px',
                      marginBottom: '10px',
                    }}
                  >
                    A1
                  </div>
                  <div style={{ borderTop: '1px dashed #000', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>生ビール</span>
                      <span>x2</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>ハイボール</span>
                      <span>x1</span>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px dashed #000', paddingTop: '10px', marginTop: '10px', fontSize: '11px', color: '#666' }}>
                    <div>21:45:30</div>
                    <div>#A1B2C3</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 管理画面 */}
          {activeSection === 'admin' && (
            <div>
              <SectionTitle>管理画面の使い方</SectionTitle>

              <div style={{ marginBottom: '40px' }}>
                <SubTitle>管理画面へのアクセス</SubTitle>
                <div
                  style={{
                    padding: '24px',
                    background: '#1c1c26',
                    border: '1px solid #2a2a36',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '13px', color: '#6a6a6a', marginBottom: '12px' }}>ブラウザで以下のURLを開く</div>
                  <a
                    href="/admin"
                    target="_blank"
                    style={{
                      display: 'inline-block',
                      padding: '16px 32px',
                      background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
                      color: '#0a0a0c',
                      textDecoration: 'none',
                      fontSize: '16px',
                      fontWeight: 700,
                    }}
                  >
                    drinkqr.vercel.app/admin
                  </a>
                </div>
              </div>

              <SubTitle>画面の見方</SubTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
                {[
                  { name: '注文一覧', url: '/admin', desc: '今日の注文をリアルタイムで確認' },
                  { name: '印刷状況', url: '/admin/print-jobs', desc: '印刷の成功・失敗を確認' },
                  { name: 'メニュー編集', url: '/admin/menu', desc: 'ドリンクメニューの追加・変更・削除' },
                ].map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '20px',
                      background: '#1c1c26',
                      border: '1px solid #2a2a36',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, marginBottom: '4px', color: '#f5f0e6' }}>{item.name}</div>
                      <div style={{ fontSize: '13px', color: '#6a6a6a' }}>{item.desc}</div>
                    </div>
                    <div style={{ color: '#d4af37', fontSize: '18px' }}>→</div>
                  </a>
                ))}
              </div>

              <SubTitle>メニューの変更方法</SubTitle>
              <ol style={{ lineHeight: 2.2, paddingLeft: '20px', color: '#c5c5c5' }}>
                <li>
                  <a href="/admin/menu" target="_blank" style={{ color: '#d4af37' }}>
                    メニュー編集画面
                  </a>
                  を開く
                </li>
                <li>「＋追加」ボタンで新しいドリンクを追加</li>
                <li>商品名・カテゴリを入力</li>
                <li>▲▼ボタンで表示順を変更</li>
                <li>「保存」ボタンをクリック</li>
              </ol>
              <WarningBox style={{ marginTop: '16px' }}>
                保存するとすぐにお客様の画面に反映されます
              </WarningBox>
            </div>
          )}

          {/* 困ったとき */}
          {activeSection === 'trouble' && (
            <div>
              <SectionTitle>困ったとき</SectionTitle>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  {
                    q: '注文が印刷されない',
                    a: [
                      'プリンターの電源が入っているか確認',
                      'USBケーブルが抜けていないか確認',
                      '印刷サーバーアプリが起動しているか確認',
                      '印刷サーバーに「接続済み」と表示されているか確認',
                    ],
                  },
                  {
                    q: 'お客様がQRコードを読み取れない',
                    a: [
                      '明るい場所で試してもらう',
                      'QRコードが汚れていないか確認',
                      '手動入力を案内: drinkqr.vercel.app でテーブル番号を入力',
                    ],
                  },
                  {
                    q: '印刷サーバーに「接続済み」と表示されない',
                    a: ['PCがインターネットに接続されているか確認', 'アプリを一度終了して再起動', 'PCを再起動'],
                  },
                  {
                    q: 'メニューを変更したのに反映されない',
                    a: ['「保存」ボタンを押したか確認', 'お客様のスマホでページを再読み込み（下に引っ張る）'],
                  },
                  {
                    q: 'プリンターから白紙が出てくる',
                    a: ['用紙がなくなっていないか確認', '用紙の向きが正しいか確認（感熱紙は裏表あり）'],
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '24px',
                      background: '#1c1c26',
                      border: '1px solid #2a2a36',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '15px',
                        marginBottom: '16px',
                        color: '#e63946',
                      }}
                    >
                      {item.q}
                    </div>
                    <div style={{ paddingLeft: '8px' }}>
                      {item.a.map((answer, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            marginBottom: '8px',
                            fontSize: '14px',
                            color: '#9a9a9a',
                          }}
                        >
                          <span style={{ color: '#d4af37' }}>—</span>
                          <span>{answer}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: '40px',
                  padding: '24px',
                  background: 'rgba(212, 175, 55, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '15px', marginBottom: '8px', color: '#c9b896' }}>上記で解決しない場合</div>
                <div style={{ fontSize: '13px', color: '#6a6a6a' }}>開発者にお問い合わせください</div>
              </div>
            </div>
          )}
        </main>

        {/* フッター */}
        <footer
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#4a4a4a',
            fontSize: '12px',
            borderTop: '1px solid #2a2a36',
            marginTop: '48px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <span style={{ width: '40px', height: '1px', background: '#2a2a36' }} />
            <span>DrinkQR</span>
            <span style={{ width: '40px', height: '1px', background: '#2a2a36' }} />
          </div>
        </footer>
      </div>
    </div>
  );
}

// コンポーネント
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "'Shippori Mincho', serif",
        fontSize: '24px',
        marginBottom: '32px',
        color: '#f5f0e6',
        letterSpacing: '0.05em',
        paddingBottom: '16px',
        borderBottom: '1px solid #2a2a36',
      }}
    >
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: '15px',
        marginBottom: '16px',
        color: '#d4af37',
        letterSpacing: '0.05em',
      }}
    >
      {children}
    </h3>
  );
}

function StepSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <SubTitle>{title}</SubTitle>
      {children}
    </div>
  );
}

function DownloadCard({
  title,
  subtitle,
  description,
  href,
  buttonText,
  note,
  featured,
}: {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  buttonText: string;
  note?: string;
  featured?: boolean;
}) {
  return (
    <div
      style={{
        padding: '28px',
        background: '#1c1c26',
        border: featured ? '2px solid #d4af37' : '1px solid #2a2a36',
        position: 'relative',
      }}
    >
      {featured && (
        <div
          style={{
            position: 'absolute',
            top: '-1px',
            right: '20px',
            background: '#d4af37',
            color: '#0a0a0c',
            padding: '4px 12px',
            fontSize: '11px',
            fontWeight: 700,
          }}
        >
          推奨
        </div>
      )}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 700, fontSize: '16px', color: '#f5f0e6', marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '12px', color: featured ? '#d4af37' : '#6a6a6a' }}>{subtitle}</div>
      </div>
      <p style={{ fontSize: '13px', color: '#9a9a9a', marginBottom: '20px', lineHeight: 1.7 }}>{description}</p>
      <a
        href={href}
        target="_blank"
        style={{
          display: 'block',
          padding: '16px',
          background: featured ? 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)' : 'transparent',
          border: featured ? 'none' : '1px solid #3a3a4a',
          color: featured ? '#0a0a0c' : '#9a9a9a',
          textDecoration: 'none',
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '14px',
        }}
      >
        {buttonText}
      </a>
      {note && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(212, 175, 55, 0.05)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            fontSize: '12px',
            color: '#c9b896',
          }}
        >
          {note}
        </div>
      )}
    </div>
  );
}

function DownloadLink({ href, label, size }: { href: string; label: string; size: string }) {
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: '#0a0a0c',
        border: '1px solid #3a3a4a',
        color: '#f5f0e6',
        textDecoration: 'none',
        fontSize: '14px',
        transition: 'border-color 0.2s',
      }}
    >
      <span>{label}</span>
      <span style={{ fontSize: '12px', color: '#6a6a6a' }}>{size}</span>
    </a>
  );
}

function InfoBox({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        padding: '16px 20px',
        background: 'rgba(212, 175, 55, 0.05)',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        fontSize: '13px',
        color: '#c9b896',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function WarningBox({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        padding: '16px 20px',
        background: 'rgba(230, 57, 70, 0.05)',
        border: '1px solid rgba(230, 57, 70, 0.2)',
        fontSize: '13px',
        color: '#e63946',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SuccessBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: '24px',
        background: '#1c1c26',
        border: '2px solid #d4af37',
        textAlign: 'center',
        marginTop: '40px',
      }}
    >
      <div
        style={{
          fontFamily: "'Shippori Mincho', serif",
          fontSize: '18px',
          color: '#d4af37',
          marginBottom: '8px',
        }}
      >
        完了
      </div>
      <div style={{ fontSize: '14px', color: '#c9b896' }}>{children}</div>
    </div>
  );
}
