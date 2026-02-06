import Link from 'next/link';

export default function TermsPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0c 0%, #12121a 100%)',
        color: '#f5f0e6',
        fontFamily: "'Zen Kaku Gothic New', sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '20px 40px',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "'Shippori Mincho', serif",
            fontSize: '20px',
            fontWeight: 600,
            color: '#d4af37',
            textDecoration: 'none',
          }}
        >
          DrinkQR
        </Link>
      </header>

      {/* Content */}
      <main
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '60px 24px',
        }}
      >
        <h1
          style={{
            fontFamily: "'Shippori Mincho', serif",
            fontSize: '28px',
            marginBottom: '40px',
            color: '#f5f0e6',
          }}
        >
          利用規約
        </h1>

        <div style={{ fontSize: '14px', lineHeight: 1.9, color: '#9a9a9a' }}>
          <p style={{ marginBottom: '24px' }}>
            本利用規約（以下「本規約」といいます。）は、DrinkQR（以下「当社」といいます。）が提供するQRオーダーサービス「DrinkQR」（以下「本サービス」といいます。）の利用条件を定めるものです。ご利用にあたっては、本規約に同意いただく必要があります。
          </p>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第1条（適用）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            1. 本規約は、お客様と当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。
          </p>
          <p style={{ marginBottom: '16px' }}>
            2. 当社は本サービスに関し、本規約のほか、ご利用にあたってのルール等、各種の定め（以下「個別規定」といいます。）をすることがあります。これら個別規定はその名称のいかんに関わらず、本規約の一部を構成するものとします。
          </p>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第2条（利用登録）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            1. 本サービスにおいては、登録希望者が本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
          </p>
          <p style={{ marginBottom: '16px' }}>
            2. 当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。
          </p>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li>利用登録の申請に際して虚偽の事項を届け出た場合</li>
            <li>本規約に違反したことがある者からの申請である場合</li>
            <li>その他、当社が利用登録を相当でないと判断した場合</li>
          </ul>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第3条（アカウントの管理）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            1. お客様は、自己の責任において、本サービスのアカウント（メールアドレスおよびパスワード）を適切に管理するものとします。
          </p>
          <p style={{ marginBottom: '16px' }}>
            2. お客様は、いかなる場合にも、アカウントを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。
          </p>
          <p style={{ marginBottom: '16px' }}>
            3. 当社は、メールアドレスとパスワードの組み合わせが登録情報と一致してログインされた場合には、そのアカウントを登録しているお客様自身による利用とみなします。
          </p>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第4条（利用料金および支払方法）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            1. お客様は、本サービスの有料部分の対価として、当社が別途定め、本ウェブサイトに表示する利用料金を、当社が指定する方法により支払うものとします。
          </p>
          <p style={{ marginBottom: '16px' }}>
            2. お客様が利用料金の支払を遅滞した場合には、お客様は年14.6％の割合による遅延損害金を支払うものとします。
          </p>
          <p style={{ marginBottom: '16px' }}>
            3. 無料トライアル期間終了後、自動的に有料プランへ移行します。課金を希望されない場合は、トライアル期間中に解約手続きを行ってください。
          </p>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第5条（禁止事項）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            お客様は、本サービスの利用にあたり、以下の行為をしてはなりません。
          </p>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為</li>
            <li>当社、ほかのお客様、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
            <li>本サービスによって得られた情報を商業的に利用する行為</li>
            <li>当社のサービスの運営を妨害するおそれのある行為</li>
            <li>不正アクセスをし、またはこれを試みる行為</li>
            <li>他のお客様に関する個人情報等を収集または蓄積する行為</li>
            <li>不正な目的を持って本サービスを利用する行為</li>
            <li>本サービスの他のお客様またはその他の第三者に不利益、損害、不快感を与える行為</li>
            <li>他のお客様に成りすます行為</li>
            <li>当社が許諾しない本サービス上での宣伝、広告、勧誘、または営業行為</li>
            <li>当社のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
            <li>その他、当社が不適切と判断する行為</li>
          </ul>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第6条（本サービスの提供の停止等）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            1. 当社は、以下のいずれかの事由があると判断した場合、お客様に事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
          </p>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
            <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
            <li>コンピュータまたは通信回線等が事故により停止した場合</li>
            <li>その他、当社が本サービスの提供が困難と判断した場合</li>
          </ul>
          <p style={{ marginBottom: '16px' }}>
            2. 当社は、本サービスの提供の停止または中断により、お客様または第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。
          </p>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第7条（退会）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            お客様は、当社の定める退会手続により、本サービスから退会できるものとします。退会時に未払いの利用料金がある場合は、退会後も支払義務が継続します。
          </p>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第8条（保証の否認および免責事項）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            1. 当社は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
          </p>
          <p style={{ marginBottom: '16px' }}>
            2. 当社は、本サービスに起因してお客様に生じたあらゆる損害について、当社の故意又は重過失による場合を除き、一切の責任を負いません。
          </p>
          <p style={{ marginBottom: '16px' }}>
            3. 当社は、本サービスに関して、お客様と他のお客様または第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
          </p>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第9条（サービス内容の変更等）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            当社は、お客様への事前の告知をもって、本サービスの内容を変更、追加または廃止することがあり、お客様はこれを承諾するものとします。
          </p>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第10条（利用規約の変更）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            1. 当社は以下の場合には、お客様の個別の同意を要せず、本規約を変更することができるものとします。
          </p>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li>本規約の変更がお客様の一般の利益に適合するとき</li>
            <li>本規約の変更が本サービス利用契約の目的に反せず、かつ、変更の必要性、変更後の内容の相当性その他の変更に係る事情に照らして合理的なものであるとき</li>
          </ul>
          <p style={{ marginBottom: '16px' }}>
            2. 当社はお客様に対し、前項による本規約の変更にあたり、事前に、本規約を変更する旨および変更後の本規約の内容並びにその効力発生時期を通知します。
          </p>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第11条（個人情報の取扱い）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            当社は、本サービスの利用によって取得する個人情報については、当社「プライバシーポリシー」に従い適切に取り扱うものとします。
          </p>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第12条（準拠法・裁判管轄）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            1. 本規約の解釈にあたっては、日本法を準拠法とします。
          </p>
          <p style={{ marginBottom: '16px' }}>
            2. 本サービスに関して紛争が生じた場合には、東京地方裁判所を専属的合意管轄とします。
          </p>

          <p style={{ marginTop: '60px', color: '#6a6a6a' }}>
            制定日：2025年1月31日
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '40px 24px',
          borderTop: '1px solid #2a2a36',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginBottom: '16px' }}>
          <Link href="/" style={{ color: '#6a6a6a', textDecoration: 'none', fontSize: '13px' }}>
            トップ
          </Link>
          <Link href="/privacy" style={{ color: '#6a6a6a', textDecoration: 'none', fontSize: '13px' }}>
            プライバシーポリシー
          </Link>
        </div>
        <div style={{ color: '#4a4a4a', fontSize: '12px' }}>
          © 2025 DrinkQR
        </div>
      </footer>
    </div>
  );
}
