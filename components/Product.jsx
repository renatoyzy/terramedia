import styles from "@/components/Product.module.css";
import Popup from 'reactjs-popup';
import Link from "next/link";
import { useEffect, useState } from 'react';

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

/**
 * Traduz o status do pagamento
 * @param {String} status - Status do pagamento 
 * @returns {String} Status traduzido
 */
function translateStatus(status) {
    const map = {
        approved: 'Aprovado',
        pending: 'Pendente',
        rejected: 'Rejeitado',
        cancelled: 'Cancelado',
    };
    return map[status] || status;
}

/**
 * Produtos disponíveis na loja
 */
export const PRODUCTS = {
    'Ranks': [
        {
            name: 'VIP',
            id: 'vip',
            price: 10.1,
            description: 'O VIP é o rank mais popular do servidor, com várias vantagens legais e cosméticos interessantes.',
            expanded_description: 'O VIP é o rank mais popular do servidor, com várias vantagens legais como melhorias cosméticas, como: Conseguir colorir o nome de itens na bigorna; Utilizar Veinminer; Utilizar /armadurainvisível para ocultar armadura e também /chapéu para exibir um chapéu cosmético na cabeça, mantendo as propriedades de proteção do capacete original; Criar ImageFrames animados (GIF); Personalizar o próprio nick in-game através do /apelido; Enviar mensagens coloridas; Nick azul (única tag com nick colorido) e Liberação de partículas ao andar! Além disso, você ajuda a manter o servidor ativo e em crescimento. O VIP dura 30 dias e é renovável.',
            icon: 'https://minecraft.wiki/images/Diamond_JE3_BE3.png?99d00',
            fields: [
                {
                    name: 'quantity',
                    type: 'number',
                    placeholder: 'Meses (1-12)',
                    required: true,
                    min: 1,
                    max: 12,
                },
            ],
        }
    ],
    'Itens': [
        {
            name: 'Warp Stone',
            id: 'warp_stone',
            price: 5.05,
            description: 'A Warp Stone é um item poderoso que permite teletransporte instantâneo por todo o servidor, direto para suas Waystones.',
            expanded_description: 'A Warp Stone é um item poderoso que permite teletransporte instantâneo por todo o servidor. É ideal para jogadores que desejam se mover rapidamente entre diferentes waystones colocadas pelo mundo. A Warp Stone possui durabilidade e consome XP.',
            icon: 'images/warp_stone.png',
            fields: [
                {
                    name: 'quantity',
                    type: 'number',
                    placeholder: 'Quantidade (1-64)',
                    required: true,
                    min: 1,
                    max: 64,
                },
            ],
        }
    ],
    'Outros': [
        {
            name: 'Aumento de Barreira',
            id: 'barreira',
            price: 1.01,
            description: 'Aumente o raio da barreira do mundo do servidor.',
            expanded_description: 'Dois em um: com um real você aumenta o diâmetro da barreira do servidor em 2 blocos, sendo 1 bloco em cada direção cardinal.',
            icon: 'https://minecraft.wiki/images/Diamond_JE3_BE3.png?99d00',
            fields: [
                {
                    name: 'quantity',
                    type: 'number',
                    placeholder: 'Blocos (1-100)',
                    required: true,
                    min: 1,
                    max: 100,
                },
            ],
        }
    ]
}

/**
 * Cupons disponíveis
 */
export const COUPONS = {
    'GUEDEASMP': 0.00,
    'EIMANESMP': 0.00,
    'SMPRAIZ': 0.00,
    'LEGIAOTEMPLARIA': 0.00,
    'ASAHISMP': 0.00,
    'CUBOPOLIS': 0.00
}

/**
 * Função para renderizar campos dinâmicos
 * @param {{}} field - Objeto do field dos produtos
 * @param {String} productName - Nome do produto
 * @returns {JSX.Element} Campo renderizado
 */
function renderField(field, productName) {
    const fieldId = `${productName}-${field.name}`;

    if (field.type === "select") {
        return (
            <select
                key={field.name}
                name={field.name}
                id={fieldId}
                required={field.required || false}
                defaultValue=""
            >
                <option value="" disabled>{field.placeholder}</option>
                {field.options?.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        );
    } else {
        if(field.name == 'quantity') return;
        return (
            <input
                key={field.name}
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                id={fieldId}
                required={field.required || false}
                min={field.min}
                max={field.max}
                defaultValue={field.defaultValue || ''}
            />
        );
    }
}

/**
 * Popup de compra do produto
 * @param {Object} properties
 * @param {{}} properties.product 
 * @returns {JSX.Element} Popup de compra do produto
 */
function ProductPopup({ product }) {
    const [currentStep, setCurrentStep] = useState('form');
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [error, setError] = useState(null);
    const [pollingId, setPollingId] = useState(null);

    const [playerName, setPlayerName] = useState('');
    const [coupon, setCoupon] = useState('');
    const [previewPrice, setPreviewPrice] = useState(product.price);
    const [quantity, setQuantity] = useState(product.fields?.find(f => f.name === 'quantity')?.defaultValue || undefined);
    const [couponStatus, setCouponStatus] = useState(null);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch('/api/sell', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                setPaymentData(result);
                setCurrentStep('payment');
                startPaymentPolling(result.paymentId);
            } else {
                setError(result.message || 'Erro ao processar compra');
            }
        } catch (err) {
            setError('Erro de conexão. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // Preview do preço considerando quantidade e cupom
    useEffect(() => {
        let basePrice = product.price;
        let qty = Number(quantity) || 1;
        let finalPrice = clamp(basePrice * qty, 0.01, 999999);

        // Simulação de cupom (pode ser adaptado para API)
        if (Object.keys(COUPONS).includes(coupon.trim().toUpperCase())) {
            finalPrice = clamp(finalPrice * (1 - COUPONS[coupon.trim().toUpperCase()]), 0.01, 999999);
            setCouponStatus(`Cupom aplicado: ${COUPONS[coupon.trim().toUpperCase()] * 100}% de desconto!`);
        } else if (coupon.trim()) {
            setCouponStatus('Cupom inválido ou expirado.');
        } else {
            setCouponStatus(null);
        }
        setPreviewPrice(finalPrice.toFixed(2));
    }, [quantity, coupon, product.price]);

    const startPaymentPolling = (paymentId) => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`/api/payment-status/${paymentId}`);
                const result = await response.json();
                setPaymentStatus(result.status);
            } catch (err) {
                console.warn("Erro ao verificar pagamento", err);
            }
        }, 5000);

        setPollingId(interval);
        setTimeout(() => clearInterval(interval), 10 * 60 * 1000);
    };

    // useEffect para entrega automática quando aprovado
    useEffect(() => {
        if (paymentStatus === 'approved' && paymentData) {
            // Para o polling
            if (pollingId) clearInterval(pollingId);

            setCurrentStep('success');

            // Entrega o item
            fetch('/api/deliver', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    player: paymentData.player,
                    product: paymentData.product,
                    productName: paymentData.productName,
                    amount: paymentData.amount,
                    quantity: paymentData.quantity,
                    coupon: paymentData.coupon,
                    extra: {
                        color: paymentData.color,
                        custom_color: paymentData.custom_color,
                    }
                }),
            });
        }
    }, [paymentStatus, paymentData, pollingId]);

    const resetPopup = () => {
        setCurrentStep('form');
        setPaymentData(null);
        setError(null);
        setLoading(false);
        setPaymentStatus(null);
    };

    return (
        <Popup
            trigger={<button className="button"> COMPRAR! </button>}
            modal
            nested
            onClose={resetPopup}
        >
            {close => (
                <div className="modal">
                    <header className="header">
                        <span>
                            <img src={product.icon} alt={`Ícone de ${product.name}`} />
                            {product.name}
                        </span>
                        <span style={{fontFamily: 'Minecraftia', opacity: '75%'}}>
                            R${paymentData?.amount?.toFixed(2) || previewPrice}
                        </span>
                    </header>

                    <main className="content">
                        {currentStep === 'form' && (
                            <>
                                <p>{product.expanded_description}</p>

                                {error && (
                                    <div className="error-message" style={{ color: 'red', fontWeight: 'bold' }}>
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleFormSubmit}>
                                    <input type="hidden" name="product" value={product.id} />
                                    <input type="hidden" name="productName" value={product.name} />

                                    <div id={styles.playerInput}>
                                        <img 
                                            src={playerName.startsWith('_') ? 
                                                `https://api.creepernation.net/avatar/${playerName.slice(1)}/bedrock`
                                                : `https://mc-heads.net/avatar/${playerName}`} 
                                            width={160}
                                            height={160}
                                            onError={(e) => e.target.src = 'https://mc-heads.net/avatar/MHF_Steve'}
                                        />
                                        
                                        <input
                                            type="text"
                                            name="player"
                                            placeholder={'Nick do jogador...'}
                                            id={`${product.id}-player`}
                                            required={true}
                                            value={playerName}
                                            onChange={(e) => setPlayerName(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 16))}
                                        />
                                    </div>
                                    
                                    {/* Campo de quantidade se existir */}
                                    {product.fields?.filter(field => field.name === 'quantity').map(field => (
                                        <input
                                            key={field.name}
                                            type="number"
                                            name="quantity"
                                            placeholder={field.placeholder}
                                            id={`${product.id}-quantity`}
                                            required={field.required || false}
                                            min={field.min}
                                            max={field.max}
                                            value={quantity}
                                            onChange={e => setQuantity(e.target.value)}
                                        />
                                    ))}

                                    {/* Outros campos */}
                                    {product.fields?.map(field => renderField(field, product.id))}
                                    
                                    {/* Campo de cupom de desconto */}
                                    <input
                                        type="text"
                                        name="coupon"
                                        id="coupon"
                                        placeholder="Cupom de desconto? (ex: DESCONTO10)"
                                        value={coupon}
                                        onChange={e => setCoupon(e.target.value.toUpperCase().replace(/[^A-Z0-9]+/g, ''))}
                                    />
                                    {couponStatus && (
                                        <span style={{ color: couponStatus.includes('Cupom aplicado') ? 'lime' : 'red' }}>
                                            {couponStatus}
                                        </span>
                                    )}

                                    <p className={styles.terms}>Ao confirmar a compra do produto você afirma que concorda com nossos <Link href={'/terms'}>Termos de Uso</Link> e <Link href={'/privacy'}>Política de privacidade</Link>.</p>

                                    <div className="actions">
                                        <a onClick={close} disabled={loading}>Cancelar</a>
                                        <button type="submit" disabled={loading}>
                                            {loading ? 'Processando...' : 'Comprar!'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {currentStep === 'payment' && paymentData && (
                            <div className={styles.paymentStep}>
                                <p>Escaneie o QR Code abaixo para efetuar o pagamento:</p>

                                <img
                                    src={`data:image/png;base64,${paymentData.qrCodeBase64}`}
                                    alt="QR Code PIX"
                                    style={{ maxWidth: '300px' }}
                                />
                                <div className={styles.paymentInfo}>
                                    <p>{translateStatus(paymentStatus)}</p>
                                </div>

                                <div className="actions">
                                    <div className={styles.pixCopyPaste}>
                                        <p>Ou copie o código PIX:</p>
                                        <div id={styles.pixCodeContainer}>
                                            <input
                                                type="text"
                                                value={paymentData.pixCode}
                                                name="pixCode"
                                                id="pixCode"
                                                readOnly
                                                onClick={(e) => e.target.select()}
                                            />
                                            <button
                                                onClick={() => navigator.clipboard.writeText(paymentData.pixCode)}
                                            >
                                                Copiar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 'success' && (
                            <div className={styles.successStep}>
                                <h3>🎉 Pagamento Confirmado!</h3>
                                <p>Sua compra foi processada com sucesso!</p>
                                <p>O produto {product.name} será entregue em breve no servidor.</p>

                                <div className="actions">
                                    <button onClick={close}>Fechar</button>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            )}
        </Popup>
    );
}

/**
 * Componente de produto
 * @param {Object} properties - Propriedades do componente
 * @param {{}} properties.product - Produto a ser exibido
 * @returns {JSX.Element} Componente de produto
 */
export default function Product({ product }) {
    return (
        <div className={styles.product}>
            <header>
                <h3>{product.name} <span>R${product.price}</span></h3>
                <img src={product.icon} alt={`Ícone de ${product.name}`} />

                <main>
                    <p>{product.description}</p>
                </main>
            </header>

            <footer>
                <ProductPopup product={product} />
            </footer>
        </div>
    );
}