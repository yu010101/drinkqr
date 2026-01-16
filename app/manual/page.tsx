'use client';

import { useState } from 'react';

export default function ManualPage() {
  const [activeSection, setActiveSection] = useState('download');

  const sections = [
    { id: 'download', label: '⬇️ ダウンロード', icon: '⬇️' },
    { id: 'setup', label: '① 初期セットアップ', icon: '📦' },
    { id: 'daily', label: '② 毎日の使い方', icon: '☀️' },
    { id: 'order', label: '③ 注文の流れ', icon: '🍺' },
    { id: 'admin', label: '④ 管理画面の使い方', icon: '💻' },
    { id: 'trouble', label: '⑤ 困ったとき', icon: '🆘' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* ヘッダー */}
      <header
        style={{
          backgroundColor: '#1a1a2e',
          color: 'white',
          padding: '30px 20px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: '0 0 10px', fontSize: '28px' }}>
          DrinkQR 使い方マニュアル
        </h1>
        <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
          飲み放題QR注文システム
        </p>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
        {/* ナビゲーション */}
        <nav
          style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            padding: '10px 0 20px',
          }}
        >
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: activeSection === section.id ? '#007bff' : 'white',
                color: activeSection === section.id ? 'white' : '#333',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeSection === section.id ? 'bold' : 'normal',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              {section.icon} {section.label}
            </button>
          ))}
        </nav>

        {/* コンテンツ */}
        <main
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {/* ⬇️ ダウンロード */}
          {activeSection === 'download' && (
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '30px', color: '#1a1a2e' }}>
                ⬇️ ダウンロード
              </h2>

              <p style={{ marginBottom: '30px', color: '#666', lineHeight: '1.8' }}>
                DrinkQRを使うために必要なファイルをダウンロードしてください。
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 印刷サーバーアプリ */}
                <div
                  style={{
                    padding: '25px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    border: '2px solid #007bff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        backgroundColor: '#007bff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                      }}
                    >
                      🖨️
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '18px' }}>印刷サーバーアプリ</div>
                      <div style={{ fontSize: '13px', color: '#666' }}>Mac / Windows 対応（必須）</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px', lineHeight: '1.6' }}>
                    注文が入ると自動でプリンターから注文票を印刷するアプリです。<br />
                    店内のPCにインストールして使います。
                  </p>
                  <div
                    style={{
                      padding: '15px 20px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>📁 入手方法</div>
                    <div style={{ color: '#666', lineHeight: '1.6' }}>
                      初回セットアップ時にUSBメモリまたはAirDropでお渡しします。<br />
                      再ダウンロードが必要な場合は開発者にお問い合わせください。
                    </div>
                  </div>
                  <div style={{ marginTop: '15px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '12px', color: '#666', padding: '8px 12px', backgroundColor: '#e9ecef', borderRadius: '6px' }}>
                      🍎 Mac用: .dmg（約108MB）
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', padding: '8px 12px', backgroundColor: '#e9ecef', borderRadius: '6px' }}>
                      🪟 Windows用: .exe（約84MB）
                    </div>
                  </div>
                </div>

                {/* QRコード */}
                <div
                  style={{
                    padding: '25px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        backgroundColor: '#28a745',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                      }}
                    >
                      📱
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '18px' }}>QRコード一覧</div>
                      <div style={{ fontSize: '13px', color: '#666' }}>各テーブル用</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px', lineHeight: '1.6' }}>
                    各テーブルに設置するQRコードです。<br />
                    印刷して、ラミネート加工するのがおすすめです。
                  </p>
                  <a
                    href="/qrcodes/index.html"
                    target="_blank"
                    style={{
                      display: 'inline-block',
                      padding: '12px 30px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '16px',
                    }}
                  >
                    📱 QRコード一覧を開く
                  </a>
                </div>
              </div>

              <div
                style={{
                  marginTop: '30px',
                  padding: '20px',
                  backgroundColor: '#fff3cd',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              >
                <strong>💡 ダウンロード後は</strong>
                <br />
                「① 初期セットアップ」の手順に従ってインストールしてください。
              </div>
            </div>
          )}

          {/* ① 初期セットアップ */}
          {activeSection === 'setup' && (
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '30px', color: '#1a1a2e' }}>
                📦 初期セットアップ
              </h2>

              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#007bff' }}>
                  必要なもの
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                  }}
                >
                  {[
                    { name: 'タブレット', desc: '注文確認用（iPad推奨）', icon: '📱' },
                    { name: 'PC', desc: '印刷サーバー用', icon: '💻' },
                    { name: 'プリンター', desc: 'SII MP-B20', icon: '🖨️' },
                    { name: 'USBケーブル', desc: 'プリンター接続用', icon: '🔌' },
                  ].map((item) => (
                    <div
                      key={item.name}
                      style={{
                        padding: '20px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '32px', marginBottom: '10px' }}>{item.icon}</div>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#007bff' }}>
                  Step 1: プリンターの接続
                </h3>
                <ol style={{ lineHeight: '2.2', paddingLeft: '20px' }}>
                  <li>プリンター（SII MP-B20）の電源を入れる</li>
                  <li>USBケーブルでPCに接続する</li>
                  <li>
                    PCがプリンターを認識したか確認
                    <ul style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                      <li>Mac: システム設定 → プリンタとスキャナ</li>
                      <li>Windows: 設定 → デバイス → プリンター</li>
                    </ul>
                  </li>
                  <li>
                    <strong>デフォルトプリンターに設定する</strong>
                    <ul style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                      <li>プリンターを右クリック →「デフォルトに設定」</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#007bff' }}>
                  Step 2: 印刷サーバーアプリのインストール
                </h3>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '15px', marginBottom: '10px' }}>🍎 Macの場合</h4>
                  <ol style={{ lineHeight: '2.2', paddingLeft: '20px' }}>
                    <li>
                      <strong>「DrinkQR印刷サーバー.dmg」</strong>をダブルクリック
                    </li>
                    <li>表示されたウィンドウで、アプリをApplicationsフォルダにドラッグ</li>
                    <li>
                      初回起動時に「開発元が未確認」と出たら：
                      <ul style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                        <li>システム設定 → プライバシーとセキュリティ →「このまま開く」</li>
                      </ul>
                    </li>
                  </ol>
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', marginBottom: '10px' }}>🪟 Windowsの場合</h4>
                  <ol style={{ lineHeight: '2.2', paddingLeft: '20px' }}>
                    <li>
                      <strong>「DrinkQR印刷サーバー.exe」</strong>をダブルクリック
                    </li>
                    <li>
                      「WindowsによってPCが保護されました」と出たら：
                      <ul style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                        <li>「詳細情報」→「実行」をクリック</li>
                      </ul>
                    </li>
                    <li>インストール不要、すぐに使えます</li>
                  </ol>
                </div>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#007bff' }}>
                  Step 3: QRコードの準備
                </h3>
                <ol style={{ lineHeight: '2.2', paddingLeft: '20px' }}>
                  <li>
                    <a
                      href="/qrcodes/index.html"
                      target="_blank"
                      style={{ color: '#007bff' }}
                    >
                      QRコード一覧ページ
                    </a>
                    を開く
                  </li>
                  <li>ブラウザの印刷機能で印刷（Ctrl+P または Cmd+P）</li>
                  <li>各テーブルにQRコードを設置</li>
                </ol>
                <div
                  style={{
                    marginTop: '15px',
                    padding: '15px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                >
                  💡 QRコードはラミネート加工すると長持ちします
                </div>
              </div>

              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#d4edda',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>✅</div>
                <div style={{ fontWeight: 'bold' }}>セットアップ完了！</div>
                <div style={{ fontSize: '14px', color: '#155724', marginTop: '5px' }}>
                  次は「毎日の使い方」を確認してください
                </div>
              </div>
            </div>
          )}

          {/* ② 毎日の使い方 */}
          {activeSection === 'daily' && (
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '30px', color: '#1a1a2e' }}>
                ☀️ 毎日の使い方
              </h2>

              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#007bff' }}>
                  営業開始時にやること
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {[
                    {
                      step: 1,
                      title: 'プリンターの電源を入れる',
                      desc: 'SII MP-B20の電源ボタンを押す',
                      time: '5秒',
                    },
                    {
                      step: 2,
                      title: 'PCで印刷サーバーを起動',
                      desc: 'Applicationsフォルダの「DrinkQR印刷サーバー」をダブルクリック',
                      time: '10秒',
                    },
                    {
                      step: 3,
                      title: '「接続済み」を確認',
                      desc: 'アプリ画面に「接続済み」と緑色で表示されればOK',
                      time: '5秒',
                    },
                    {
                      step: 4,
                      title: 'タブレットで管理画面を開く',
                      desc: 'ブラウザで drinkqr.vercel.app/admin を開く',
                      time: '10秒',
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#007bff',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          flexShrink: 0,
                        }}
                      >
                        {item.step}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '13px', color: '#666' }}>{item.desc}</div>
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#888',
                          backgroundColor: '#e9ecef',
                          padding: '4px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {item.time}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: '#e7f3ff',
                    borderRadius: '8px',
                    fontSize: '14px',
                    textAlign: 'center',
                  }}
                >
                  ⏱️ 全部で<strong>約30秒</strong>で準備完了！
                </div>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#007bff' }}>
                  営業終了時にやること
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {[
                    {
                      step: 1,
                      title: '印刷サーバーを終了',
                      desc: 'タスクバーのアイコンを右クリック →「終了」',
                    },
                    {
                      step: 2,
                      title: 'プリンターの電源を切る',
                      desc: 'SII MP-B20の電源ボタンを押す',
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          flexShrink: 0,
                        }}
                      >
                        {item.step}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '13px', color: '#666' }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ③ 注文の流れ */}
          {activeSection === 'order' && (
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '30px', color: '#1a1a2e' }}>
                🍺 注文の流れ
              </h2>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0',
                }}
              >
                {[
                  {
                    icon: '📱',
                    title: 'お客様がQRコードをスキャン',
                    desc: 'スマホのカメラでテーブルのQRコードを読み取る',
                    color: '#007bff',
                  },
                  {
                    icon: '🍺',
                    title: 'ドリンクを選んで注文',
                    desc: '＋ボタンで数量を選び「注文する」をタップ',
                    color: '#28a745',
                  },
                  {
                    icon: '✅',
                    title: '注文完了画面が表示',
                    desc: 'お客様のスマホに注文番号と内容が表示される',
                    color: '#ffc107',
                  },
                  {
                    icon: '🖨️',
                    title: '自動で注文票が印刷される',
                    desc: '厨房のプリンターから注文票が出てくる',
                    color: '#dc3545',
                  },
                  {
                    icon: '🍻',
                    title: 'ドリンクを作って提供',
                    desc: '注文票を見てドリンクを準備、お客様に提供',
                    color: '#6f42c1',
                  },
                ].map((item, index) => (
                  <div key={index}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        padding: '20px',
                      }}
                    >
                      <div
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          backgroundColor: item.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '28px',
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>{item.desc}</div>
                      </div>
                    </div>
                    {index < 4 && (
                      <div
                        style={{
                          width: '2px',
                          height: '30px',
                          backgroundColor: '#ddd',
                          marginLeft: '49px',
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: '30px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                }}
              >
                <h4 style={{ marginBottom: '15px' }}>📋 印刷される注文票のイメージ</h4>
                <div
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    padding: '20px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    maxWidth: '250px',
                  }}
                >
                  <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '10px' }}>
                    【注文票】
                  </div>
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
                      <span>×2</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>ハイボール</span>
                      <span>×1</span>
                    </div>
                  </div>
                  <div
                    style={{
                      borderTop: '1px dashed #000',
                      paddingTop: '10px',
                      marginTop: '10px',
                      fontSize: '11px',
                      color: '#666',
                    }}
                  >
                    <div>21:45:30</div>
                    <div>#A1B2C3</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ④ 管理画面の使い方 */}
          {activeSection === 'admin' && (
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '30px', color: '#1a1a2e' }}>
                💻 管理画面の使い方
              </h2>

              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#007bff' }}>
                  管理画面へのアクセス
                </h3>
                <div
                  style={{
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                    ブラウザで以下のURLを開く
                  </div>
                  <a
                    href="/admin"
                    target="_blank"
                    style={{
                      display: 'inline-block',
                      padding: '15px 30px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                    }}
                  >
                    drinkqr.vercel.app/admin
                  </a>
                </div>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#007bff' }}>
                  画面の見方
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {[
                    {
                      name: '注文一覧',
                      url: '/admin',
                      desc: '今日の注文をリアルタイムで確認',
                      icon: '📋',
                    },
                    {
                      name: '印刷状況',
                      url: '/admin/print-jobs',
                      desc: '印刷の成功・失敗を確認',
                      icon: '🖨️',
                    },
                    {
                      name: 'メニュー編集',
                      url: '/admin/menu',
                      desc: 'ドリンクメニューの追加・変更・削除',
                      icon: '🍺',
                    },
                  ].map((item) => (
                    <a
                      key={item.name}
                      href={item.url}
                      target="_blank"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      <div style={{ fontSize: '28px' }}>{item.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>{item.name}</div>
                        <div style={{ fontSize: '13px', color: '#666' }}>{item.desc}</div>
                      </div>
                      <div style={{ color: '#007bff' }}>→</div>
                    </a>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#007bff' }}>
                  メニューの変更方法
                </h3>
                <ol style={{ lineHeight: '2.2', paddingLeft: '20px' }}>
                  <li>
                    <a href="/admin/menu" target="_blank" style={{ color: '#007bff' }}>
                      メニュー編集画面
                    </a>
                    を開く
                  </li>
                  <li>「＋追加」ボタンで新しいドリンクを追加</li>
                  <li>商品名・カテゴリを入力</li>
                  <li>▲▼ボタンで表示順を変更</li>
                  <li>「保存」ボタンをクリック</li>
                </ol>
                <div
                  style={{
                    marginTop: '15px',
                    padding: '15px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                >
                  ⚠️ 保存するとすぐにお客様の画面に反映されます
                </div>
              </div>
            </div>
          )}

          {/* ⑤ 困ったとき */}
          {activeSection === 'trouble' && (
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '30px', color: '#1a1a2e' }}>
                🆘 困ったとき
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                    a: [
                      'PCがインターネットに接続されているか確認',
                      'アプリを一度終了して再起動',
                      'PCを再起動',
                    ],
                  },
                  {
                    q: 'メニューを変更したのに反映されない',
                    a: [
                      '「保存」ボタンを押したか確認',
                      'お客様のスマホでページを再読み込み（下に引っ張る）',
                    ],
                  },
                  {
                    q: 'プリンターから白紙が出てくる',
                    a: [
                      '用紙がなくなっていないか確認',
                      '用紙の向きが正しいか確認（感熱紙は裏表あり）',
                    ],
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '20px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 'bold',
                        fontSize: '16px',
                        marginBottom: '15px',
                        color: '#dc3545',
                      }}
                    >
                      ❓ {item.q}
                    </div>
                    <div style={{ paddingLeft: '10px' }}>
                      {item.a.map((answer, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            marginBottom: '8px',
                            fontSize: '14px',
                          }}
                        >
                          <span style={{ color: '#28a745' }}>✓</span>
                          <span>{answer}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: '30px',
                  padding: '20px',
                  backgroundColor: '#e7f3ff',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '16px', marginBottom: '10px' }}>
                  上記で解決しない場合
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  開発者にお問い合わせください
                </div>
              </div>
            </div>
          )}
        </main>

        {/* フッター */}
        <footer
          style={{
            textAlign: 'center',
            padding: '30px',
            color: '#888',
            fontSize: '12px',
          }}
        >
          DrinkQR © 2024
        </footer>
      </div>
    </div>
  );
}
