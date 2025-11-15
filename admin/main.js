const state = {
  users: [
    {
      id: 'u1',
      name: 'Иван Петров',
      phone: '+7 (900) 111-22-33',
      onboardingStep: 'SMS_VERIFICATION',
      esia: false,
      status: 'PENDING'
    },
    {
      id: 'u2',
      name: 'Анна Соколова',
      phone: '+7 (921) 555-66-77',
      onboardingStep: 'ESIA_AUTH',
      esia: false,
      status: 'ACTIVE'
    },
    {
      id: 'u3',
      name: 'Сергей Ким',
      phone: '+7 (999) 888-44-22',
      onboardingStep: 'COMPLETE',
      esia: true,
      status: 'ACTIVE'
    }
  ],
  offers: [
    {
      id: 'o1',
      title: 'Скидка 10% на электронику',
      partner: 'TechLine',
      discount: '10%',
      period: '01.03 – 30.04',
      published: true
    },
    {
      id: 'o2',
      title: 'Промокод на доставку',
      partner: 'FoodGo',
      discount: 'Бесплатно',
      period: 'Всегда',
      published: false
    }
  ],
  benefits: [
    {
      id: 'b1',
      title: 'Компенсация ЖКХ',
      category: 'VETERAN',
      region: 'СПб',
      availability: 'Доступно'
    },
    {
      id: 'b2',
      title: 'Соц. контракт',
      category: 'LOW_INCOME',
      region: 'Москва',
      availability: 'Заявка необходима'
    }
  ]
};

const BENEFIT_CATEGORIES = [
  'PENSIONER',
  'DISABLED_1',
  'DISABLED_2',
  'DISABLED_3',
  'MULTICHILD_PARENT',
  'VETERAN',
  'LOW_INCOME',
  'STUDENT',
  'DISABLED_CHILD_PARENT'
];

const API_BASE = '/api';
const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken') || '';
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

const formatStep = step => {
  switch (step) {
    case 'SMS_VERIFICATION':
      return 'SMS подтверждение';
    case 'ESIA_AUTH':
      return 'Требуется Госуслуги';
    case 'COMPLETE':
      return 'Онбординг завершен';
    default:
      return step;
  }
};

const renderStats = () => {
  const total = state.users.length;
  const pending = state.users.filter(u => u.onboardingStep === 'SMS_VERIFICATION').length;
  const verified = state.users.filter(u => u.esia).length;
  $('#stat-total-users').textContent = total;
  $('#stat-pending-users').textContent = pending;
  $('#stat-verified-users').textContent = verified;
  $('#stat-offers').textContent = state.offers.length;
};

const renderUsers = () => {
  const tbody = $('#users-table-body');
  tbody.innerHTML = '';

  state.users.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.name}</td>
      <td>${user.phone}</td>
      <td><span class="badge badge--pending">${formatStep(user.onboardingStep)}</span></td>
      <td>
        <span class="badge ${user.esia ? 'badge--active' : 'badge--locked'}">
          ${user.esia ? 'Подтвержден' : 'Нет'}
        </span>
      </td>
      <td>
        <span class="badge ${user.status === 'ACTIVE' ? 'badge--active' : 'badge--pending'}">
          ${user.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING'}
        </span>
      </td>
      <td class="actions"></td>
    `;

    const actions = tr.querySelector('.actions');
    const btn = document.createElement('button');
    btn.className = 'btn btn--primary';
    btn.textContent = user.status === 'ACTIVE' ? 'Отозвать доступ' : 'Активировать';
    btn.addEventListener('click', () => toggleUserStatus(user.id));

    const esiaBtn = document.createElement('button');
    esiaBtn.className = 'btn';
    esiaBtn.style.marginLeft = '8px';
    esiaBtn.textContent = user.esia ? 'Сбросить ГОС' : 'Отметить ГОС';
    esiaBtn.addEventListener('click', () => toggleEsia(user.id));

    actions.append(btn, esiaBtn);
    tbody.appendChild(tr);
  });
};

const renderOffers = () => {
  const tbody = $('#offers-table-body');
  tbody.innerHTML = '';
  state.offers.forEach(offer => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${offer.title}</td>
      <td>${offer.partner}</td>
      <td>${offer.discount}</td>
      <td>${offer.period}</td>
      <td>
        <span class="badge ${offer.published ? 'badge--active' : 'badge--pending'}">
          ${offer.published ? 'Да' : 'Черновик'}
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
};

const renderBenefits = () => {
  const tbody = $('#benefits-table-body');
  tbody.innerHTML = '';
  state.benefits.forEach(benefit => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${benefit.title}</td>
      <td>${benefit.category}</td>
      <td>${benefit.region}</td>
      <td>${benefit.availability}</td>
    `;
    tbody.appendChild(tr);
  });
};

const addOffer = data => {
  state.offers = [
    ...state.offers,
    {
      id: `o_${Date.now()}`,
      title: data.title,
      partner: data.partner,
      discount: data.discount,
      period: data.period,
      published: data.published
    }
  ];
  renderOffers();
  renderStats();
};

const addBenefit = data => {
  state.benefits = [
    ...state.benefits,
    {
      id: `b_${Date.now()}`,
      title: data.title,
      category: data.category,
      region: data.region,
      availability: data.availability
    }
  ];
  renderBenefits();
};

const bindForms = () => {
  const offerForm = $('#offer-form');
  const benefitForm = $('#benefit-form');
  const categorySelect = $('#benefit-category');
  const userCategorySelect = $('#user-category-select');
  const userCategoryForm = $('#user-category-form');
  const removeCategoryBtn = $('#remove-category-btn');

  BENEFIT_CATEGORIES.forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    categorySelect.appendChild(option);

    const option2 = option.cloneNode(true);
    userCategorySelect.appendChild(option2);
  });

  offerForm.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(offerForm);
    addOffer({
      title: formData.get('title') || '',
      partner: formData.get('partner') || '',
      discount: formData.get('discount') || '',
      period: formData.get('period') || '',
      published: Boolean(formData.get('published'))
    });
    offerForm.reset();
  });

  benefitForm.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(benefitForm);
    addBenefit({
      title: formData.get('title') || '',
      category: formData.get('category') || '',
      region: formData.get('region') || '',
      availability: formData.get('availability') || ''
    });
    benefitForm.reset();
  });

  const submitUserCategory = async (action = 'add') => {
    const formData = new FormData(userCategoryForm);
    const payload = {
      userId: formData.get('userId') || '',
      category: formData.get('category') || ''
    };
    const endpoint =
      action === 'remove' ? '/admin/remove-category' : '/admin/add-category';
    const status = $('#user-category-status');
    status.textContent = 'Отправка...';
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Ошибка сохранения');
      }
      status.textContent = 'Успешно.';
      console.log('User categories updated', data);
    } catch (err) {
      status.textContent = `Ошибка: ${err.message}`;
      console.error(err);
    }
  };

  userCategoryForm.addEventListener('submit', e => {
    e.preventDefault();
    submitUserCategory('add');
  });

  removeCategoryBtn.addEventListener('click', e => {
    e.preventDefault();
    submitUserCategory('remove');
  });
};

const toggleUserStatus = id => {
  state.users = state.users.map(user => {
    if (user.id !== id) return user;
    const nextStatus = user.status === 'ACTIVE' ? 'PENDING' : 'ACTIVE';
    const nextStep = nextStatus === 'ACTIVE' ? 'ESIA_AUTH' : 'SMS_VERIFICATION';
    return { ...user, status: nextStatus, onboardingStep: nextStep };
  });
  renderUsers();
  renderStats();
};

const toggleEsia = id => {
  state.users = state.users.map(user =>
    user.id === id ? { ...user, esia: !user.esia, onboardingStep: 'COMPLETE' } : user
  );
  renderUsers();
  renderStats();
};

const bindNavigation = () => {
  $$('.nav__item').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.section;
      $$('.nav__item').forEach(el => el.classList.toggle('is-active', el === btn));
      $$('.section').forEach(section =>
        section.classList.toggle('is-visible', section.dataset.section === target)
      );
    });
  });
};

const bindSettings = () => {
  $('#toggle-esia').addEventListener('change', e => {
    console.log('ESIA required:', e.target.checked);
  });
  $('#toggle-sms').addEventListener('change', e => {
    console.log('Use mocked SMS code:', e.target.checked);
  });
};

const init = () => {
  bindNavigation();
  bindSettings();
  bindForms();
  renderStats();
  renderUsers();
  renderOffers();
  renderBenefits();
};

document.addEventListener('DOMContentLoaded', init);
