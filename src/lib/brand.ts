export const brand = {
  name: 'Maurício Rocha',
  company: 'Maurício Rocha Contabilidade',
  email: 'mrochacontabil@gmail.com',
  phone: '5527998219238',
  phoneLabel: '(27) 99821-9238',
  address: 'Rod. Serafim Derenzi, 6185 · Sala 201',
  city: 'Nova Palestina, Vitória – ES',
  instagram: 'https://www.instagram.com/contabilidade.mauriciorocha/',
  // Logo oficial fornecida pelo usuário. A versão possui letras brancas.
  logo: '/brand/logo.png' as string | null,
};
export const whatsappLink = (text: string, phone = brand.phone) => `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
