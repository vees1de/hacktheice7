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
      category: 'Ветеран',
      region: 'СПб',
      availability: 'Доступно'
    },
    {
      id: 'b2',
      title: 'Соц. контракт',
      category: 'Малоимущий',
      region: 'Москва',
      availability: 'Заявка необходима'
    }
  ]
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
  renderStats();
  renderUsers();
  renderOffers();
  renderBenefits();
};

document.addEventListener('DOMContentLoaded', init);
