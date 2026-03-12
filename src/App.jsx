import React, { useEffect, useMemo, useState } from 'react';

const DEFAULT_LEAD_COST = 50;
const AVERAGE_CHECK = 4800;
const TAX_RATE = 0.07;
const PLATFORM_RATE = 0.2;
const AD_SETUP_SERVICE_COST = 70000;

const formatNumber = (value) => new Intl.NumberFormat('ru-RU').format(Math.round(Number(value) || 0));
const formatCurrency = (value) => `${formatNumber(value)} ₽`;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function Row({ label, value, muted = false, strong = false }) {
  return (
    <div className="row-line">
      <span className={strong ? 'text-strong' : muted ? 'text-muted' : 'text-normal'}>{label}</span>
      <span className={strong ? 'value-strong' : 'value-normal'}>{value}</span>
    </div>
  );
}

function getConversionMeta(conversionRate) {
  if (conversionRate <= 3) {
    return {
      containerClassName: 'conv-red',
      noteTitle: 'Пока разогреваемся 🫠',
      noteText: '',
      noteClassName: 'note-red',
    };
  }
  if (conversionRate <= 5) {
    return {
      containerClassName: 'conv-yellow',
      noteTitle: 'Уже не грустно, но ещё не праздник 🙂',
      noteText: 'Потенциал есть, конверсию можно подкрутить.',
      noteClassName: 'note-yellow',
    };
  }
  if (conversionRate <= 7) {
    return {
      containerClassName: 'conv-yellow',
      noteTitle: 'Уже хорошо 💪',
      noteText: 'Продажи пошли, осталось добавить стабильности.',
      noteClassName: 'note-yellow',
    };
  }
  if (conversionRate <= 10) {
    return {
      containerClassName: 'conv-green',
      noteTitle: 'Очень достойно 🔥',
      noteText: 'Похоже, воронка решила поработать как взрослая 😄',
      noteClassName: 'note-green',
    };
  }
  if (conversionRate <= 12) {
    return {
      containerClassName: 'conv-green',
      noteTitle: 'Очень сильно 🚀',
      noteText: 'Здесь уже не “повезло”, здесь уже система.',
      noteClassName: 'note-green',
    };
  }
  if (conversionRate <= 14) {
    return {
      containerClassName: 'conv-green',
      noteTitle: 'Вот это уровень 😮‍💨',
      noteText: 'Кажется, скрипты работают даже лучше кофе.',
      noteClassName: 'note-green',
    };
  }
  return {
    containerClassName: 'conv-green',
    noteTitle: 'Ого! Мы и не знали, что так можно 🤯',
    noteText: 'Вы не продаёте. Вы подчиняете реальность 🪄',
    noteClassName: 'note-green',
  };
}

function SliderInput({
  label,
  value,
  setValue,
  min,
  max,
  step = 1,
  suffix = '',
  description = '',
  displayValue,
  parser,
  markerValue,
  markerLabel,
  noteTitle,
  noteText,
  noteClassName = 'note-default',
  containerClassName = '',
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(String(value));

  useEffect(() => {
    if (!isEditing) setDraftValue(String(value));
  }, [value, isEditing]);

  const ratio = typeof markerValue === 'number' ? (markerValue - min) / (max - min) : 0;
  const markerLeft = `calc(${(ratio * 100).toFixed(6)}% + ${(10 - 20 * ratio).toFixed(6)}px)`;

  const parseRaw = (raw) => (parser ? parser(raw) : Number(raw));

  const handleChange = (e) => {
    const raw = e.target.value;
    setDraftValue(raw);
    if (raw === '') return;
    const parsed = parseRaw(raw);
    if (parsed === null || Number.isNaN(parsed)) return;
    setValue(clamp(parsed, min, max));
  };

  const handleFocus = () => {
    setIsEditing(true);
    setDraftValue(String(value));
  };

  const handleBlur = () => {
    if (draftValue.trim() === '') {
      setDraftValue(String(value));
      setIsEditing(false);
      return;
    }
    const parsed = parseRaw(draftValue);
    if (parsed !== null && !Number.isNaN(parsed)) {
      const nextValue = clamp(parsed, min, max);
      setValue(nextValue);
      setDraftValue(String(nextValue));
    } else {
      setDraftValue(String(value));
    }
    setIsEditing(false);
  };

  const shownValue = isEditing ? draftValue : (displayValue ?? String(value));

  return (
    <div className={`slider-card ${containerClassName}`}>
      <div className="slider-header">
        <div>
          <div className="slider-label">{label}</div>
          {description ? <div className="slider-description">{description}</div> : null}
        </div>
        <div className="value-box-wrap">
          <input
            type="text"
            value={shownValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="value-box"
          />
          {suffix ? <div className="suffix">{suffix}</div> : null}
        </div>
      </div>

      <div className="slider-area">
        {typeof markerValue === 'number' ? (
          <div className="marker-wrap" aria-hidden="true">
            <div className="marker" style={{ left: markerLeft }}>
              <div className="marker-label">{markerLabel}</div>
              <div className="marker-line" />
            </div>
          </div>
        ) : null}
        <input
          className="range"
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => setValue(Number(e.target.value))}
        />
      </div>

      <div className="slider-minmax">
        <span>{min}</span>
        <span>{max}</span>
      </div>

      {noteTitle ? (
        <div className={`note-box ${noteClassName}`}>
          <div className="note-title">{noteTitle}</div>
          {noteText ? <div className="note-text">{noteText}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

export default function App() {
  const [leadsPerDay, setLeadsPerDay] = useState(20);
  const [leadCost, setLeadCost] = useState(DEFAULT_LEAD_COST);
  const [conversionRate, setConversionRate] = useState(8);
  const [workingDays, setWorkingDays] = useState(22);
  const [includeAdSetupService, setIncludeAdSetupService] = useState(false);

  const calc = useMemo(() => {
    const leadsPerMonth = leadsPerDay * workingDays;
    const conversionRateDecimal = conversionRate / 100;
    const salesPerMonth = leadsPerMonth * conversionRateDecimal;
    const grossRevenue = salesPerMonth * AVERAGE_CHECK;
    const revenue = grossRevenue * (1 - PLATFORM_RATE);
    const adCost = leadsPerMonth * leadCost;
    const taxCost = grossRevenue * TAX_RATE;
    const adSetupServiceCost = includeAdSetupService ? AD_SETUP_SERVICE_COST : 0;
    const netProfit = revenue - adCost - taxCost - adSetupServiceCost;
    return { leadsPerMonth, salesPerMonth, revenue, adCost, adSetupServiceCost, netProfit };
  }, [leadsPerDay, leadCost, conversionRate, workingDays, includeAdSetupService]);

  const resultScale = Math.max(12, Math.min(100, (calc.netProfit / 300000) * 100));
  const conversionMeta = getConversionMeta(conversionRate);

  return (
    <div className="page">
      <div className="bg-blur bg1" />
      <div className="bg-blur bg2" />
      <div className="bg-blur bg3" />
      <div className="grid-overlay" />

      <div className="container">
        <section className="hero">
          <h1>Посчитайте, сколько сможете зарабатывать</h1>
          <p>Меняйте только ключевые показатели. Остальные расчёты подставляются автоматически.</p>

          <div className="hero-grid">
            <div className="hero-card">
              <div className="eyebrow">Готовый бизнес</div>
              <div className="hero-title">Система, в которой вы управляете ключевыми цифрами и видите потенциальную прибыль ещё до старта.</div>
              <div className="hero-copy">Без найма команды с нуля, без долгой сборки процессов и без попыток гадать на Excel. Калькулятор показывает, как меняется результат от ваших реальных показателей.</div>
              <div className="pill-grid">
                <div className="pill-card"><div className="pill-eyebrow">Быстрый старт</div><div className="pill-copy">Понятная модель входа</div></div>
                <div className="pill-card"><div className="pill-eyebrow">Контроль цифр</div><div className="pill-copy">Видно, что влияет на прибыль</div></div>
                <div className="pill-card"><div className="pill-eyebrow">Масштабирование</div><div className="pill-copy">Рост без лишней операционки</div></div>
              </div>
            </div>

            <div className="hero-card hero-card-dark">
              <div className="eyebrow green">Для предпринимателя</div>
              <div className="hero-title">Готовая модель дохода</div>
              <div className="hero-copy">Смотрите на экономику как владелец: лиды, конверсия, стоимость привлечения и итоговая прибыль — в одном экране.</div>
            </div>
          </div>
        </section>

        <section className="main-grid">
          <CardBox title="Управляйте своими показателями">
            <SliderInput label="Лидов в день" value={leadsPerDay} setValue={setLeadsPerDay} min={1} max={300} step={1} parser={(raw) => parseInt(raw.replace(/[^0-9]/g, ''), 10)} description="Сколько лидов Вы обрабатываете в день" />
            <SliderInput label="Стоимость лида" value={leadCost} setValue={setLeadCost} min={10} max={500} step={1} parser={(raw) => parseInt(raw.replace(/[^0-9]/g, ''), 10)} suffix="₽" description="Актуальную стоимость лида можно узнать у службы заботы" containerClassName="conv-yellow" />
            <SliderInput label="Конверсия в продажу" value={conversionRate} setValue={setConversionRate} min={1} max={50} step={1} displayValue={`${conversionRate}%`} parser={(raw) => parseInt(raw.replace(/[^0-9]/g, ''), 10)} description="Какой процент лидов превращается в продажу" markerValue={6} markerLabel="Среднее значение" noteTitle={conversionMeta.noteTitle} noteText={conversionMeta.noteText} noteClassName={conversionMeta.noteClassName} containerClassName={conversionMeta.containerClassName} />
            <SliderInput label="Рабочих дней в месяц" value={workingDays} setValue={setWorkingDays} min={1} max={31} step={1} parser={(raw) => parseInt(raw.replace(/[^0-9]/g, ''), 10)} description="Сколько дней в месяц Вы работаете" />
            <label className="ad-service-box">
              <input type="checkbox" checked={includeAdSetupService} onChange={(e) => setIncludeAdSetupService(e.target.checked)} />
              <div>
                <div className="ad-service-title">Настройка и ведение рекламы🔥</div>
                <div className="ad-service-copy">Дополнительная услуга: {formatCurrency(AD_SETUP_SERVICE_COST)} в месяц</div>
              </div>
            </label>
          </CardBox>

          <div className="right-column">
            <section className="result-card">
              <div className="eyebrow cyan">Ваш результат</div>
              <div className="result-copy">Сумма, которую вы можете ориентировочно забирать в месяц после рекламы и внутренних удержаний.</div>
              <div className="result-inner">
                <div className="result-label">Чистая прибыль в месяц</div>
                <div className="result-value">{formatCurrency(calc.netProfit)}</div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${resultScale}%` }} /></div>
                <div className="result-foot">Индикатор масштаба результата</div>
              </div>
            </section>

            <CardBox title="Как считается результат">
              <div className="rows">
                <Row label="Выручка" value={formatCurrency(calc.revenue)} />
                <Row label="Расходы на рекламу" value={formatCurrency(calc.adCost)} muted />
                {includeAdSetupService ? <Row label="Настройка и ведение рекламы🔥" value={formatCurrency(calc.adSetupServiceCost)} muted /> : null}
                <div className="separator" />
                <Row label="Чистая прибыль" value={formatCurrency(calc.netProfit)} strong />
              </div>
            </CardBox>
          </div>
        </section>

        <section className="cta-grid">
          <div className="cta-card">
            <div className="cta-title">Быстрая связь</div>
            <div className="cta-buttons">
              <button>Написать в Telegram</button>
              <button>Написать в WhatsApp</button>
              <button>Написать в Max</button>
              <button>Написать во ВКонтакте</button>
            </div>
          </div>

          <div className="cta-card cta-card-green">
            <div className="cta-title green-text">Готовы обсудить подключение?</div>
            <button className="apply-btn">Оставить заявку</button>
          </div>
        </section>
      </div>
    </div>
  );
}

function CardBox({ title, children }) {
  return (
    <div className="white-card">
      <div className="white-card-title">{title}</div>
      <div className="white-card-body">{children}</div>
    </div>
  );
}
