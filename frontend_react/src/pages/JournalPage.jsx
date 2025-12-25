import React, { useState } from 'react';
import { useJournal } from '../hooks/useJournal';
import { Calendar, Heart, Edit, Trash2, Plus, X } from 'lucide-react';

const COLORS = {
  primary: '#0056B3',
  secondary: '#4A90E2',
  light: '#E6F2FF',
  background: '#F8FBFF',
  white: '#FFFFFF',
  text: '#2D3748',
  gray: '#718096',
  lightGray: '#E2E8F0',
  border: '#CBD5E0',
};

const WELL_BEING_OPTIONS = [
  { value: 1, label: 'Очень плохо', color: '#E53E3E' },
  { value: 2, label: 'Плохо', color: '#ED8936' },
  { value: 3, label: 'Удовлетворительно', color: '#ECC94B' },
  { value: 4, label: 'Хорошо', color: '#48BB78' },
  { value: 5, label: 'Отлично', color: '#38A169' },
];

const PREDEFINED_SYMPTOMS = [
  'Головная боль',
  'Повышенная температура',
  'Слабость',
  'Головокружение',
  'Тошнота',
  'Кашель',
  'Одышка',
  'Боль в груди',
  'Усталость',
  'Потеря аппетита',
];

const JournalPage = () => {
  const { entries, loading, createEntry, updateEntry, deleteEntry, refetch } = useJournal();
  const [description, setDescription] = useState('');
  const [wellBeing, setWellBeing] = useState(3);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [error, setError] = useState('');

  const startEditing = (entry) => {
    setDate(entry.date);
    setWellBeing(entry.well_being_score);
    setDescription(entry.description || '');
    const predefined = entry.symptoms.filter(s => PREDEFINED_SYMPTOMS.includes(s));
    const custom = entry.symptoms.filter(s => !PREDEFINED_SYMPTOMS.includes(s))[0] || '';
    setSelectedSymptoms(predefined);
    setCustomSymptom(custom);
    setEditingId(entry.id);
    setIsFormVisible(true);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setWellBeing(3);
    setDescription('');
    setSelectedSymptoms([]);
    setCustomSymptom('');
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let allSymptoms = [...selectedSymptoms];
    const trimmedCustom = customSymptom.trim();
    if (trimmedCustom) {
      allSymptoms.push(trimmedCustom);
    }
    const data = { date, well_being_score: wellBeing, description, symptoms: allSymptoms };
    
    try {
      if (editingId) {
        await updateEntry(editingId, data);
      } else {
        await createEntry(data);
      }
      resetForm();
      setIsFormVisible(false);
      // Обновляем список записей
      await refetch();
    } catch (err) {
      console.error('Ошибка при сохранении записи:', err);
      if (err.response?.data?.details) {
        setError('Ошибка в данных: ' + JSON.stringify(err.response.data.details));
      } else {
        setError('Не удалось сохранить запись. Попробуйте позже.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      try {
        await deleteEntry(id);
        await refetch();
      } catch (err) {
        alert('Не удалось удалить запись.');
      }
    }
  };

  const toggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const buttonStyles = {
    primary: {
      backgroundColor: COLORS.primary,
      color: COLORS.white,
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '1rem',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0, 86, 179, 0.2)',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: COLORS.primary,
      border: `1px solid ${COLORS.primary}`,
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      fontWeight: '500',
      fontSize: '0.9rem',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      transition: 'all 0.2s ease',
    },
    outline: {
      backgroundColor: 'transparent',
      color: COLORS.gray,
      border: `1px solid ${COLORS.border}`,
      padding: '0.4rem 0.8rem',
      borderRadius: '20px',
      fontWeight: '400',
      fontSize: '0.85rem',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      transition: 'all 0.2s ease',
    }
  };

  return (
    <div style={{ 
      backgroundColor: COLORS.background, 
      minHeight: '100vh',
      padding: '2rem',
      color: COLORS.text
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem' 
        }}>
          <div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: COLORS.primary,
              marginBottom: '0.5rem'
            }}>
              Дневник самочувствия
            </h1>
            <p style={{ color: COLORS.gray, fontSize: '1.1rem' }}>
              Отслеживайте свое состояние и симптомы
            </p>
          </div>
          
          <button
            onClick={() => {
              if (!isFormVisible) {
                resetForm();
              }
              setIsFormVisible(!isFormVisible);
            }}
            style={{ 
              ...buttonStyles.secondary,
              ...(isFormVisible ? { backgroundColor: COLORS.light } : {})
            }}
          >
            {isFormVisible ? <X size={18} /> : <Plus size={18} />}
            {isFormVisible ? 'Скрыть форму' : 'Новая запись'}
          </button>
        </div>

        {isFormVisible && (
          <div style={{ 
            backgroundColor: COLORS.white, 
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2.5rem',
            boxShadow: '0 4px 12px rgba(0, 86, 179, 0.08)',
            border: `1px solid ${COLORS.light}`
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                backgroundColor: COLORS.light,
                borderRadius: '8px',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar size={24} color={COLORS.primary} />
              </div>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: COLORS.primary 
              }}>
                {editingId ? 'Редактирование записи' : 'Новая запись в дневнике'}
              </h2>
            </div>

            {error && (
              <div style={{ 
                backgroundColor: '#FED7D7', 
                color: '#9B2C2C', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                marginBottom: '1.5rem',
                fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '500',
                    color: COLORS.text
                  }}>
                    Дата записи
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${COLORS.border}`,
                      fontSize: '1rem',
                      backgroundColor: COLORS.white,
                      color: COLORS.text
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '500',
                    color: COLORS.text
                  }}>
                    <Heart size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Оценка самочувствия
                  </label>
                  <select
                    value={wellBeing}
                    onChange={e => setWellBeing(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${COLORS.border}`,
                      fontSize: '1rem',
                      backgroundColor: COLORS.white,
                      color: COLORS.text
                    }}
                    required
                  >
                    {WELL_BEING_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  color: COLORS.text
                }}>
                  Описание состояния
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Опишите свое самочувствие..."
                  maxLength={1000}
                  style={{
                    width: '100%',
                    height: '120px',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: `1px solid ${COLORS.border}`,
                    fontSize: '1rem',
                    backgroundColor: COLORS.white,
                    color: COLORS.text,
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
                <div style={{ textAlign: 'right', fontSize: '0.85rem', color: COLORS.gray, marginTop: '0.25rem' }}>
                  {description.length}/1000 символов
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.75rem', 
                  fontWeight: '500',
                  color: COLORS.text
                }}>
                  Симптомы
                </label>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  {PREDEFINED_SYMPTOMS.map(symptom => (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => toggleSymptom(symptom)}
                      style={{
                        ...buttonStyles.outline,
                        backgroundColor: selectedSymptoms.includes(symptom) ? COLORS.light : COLORS.white,
                        borderColor: selectedSymptoms.includes(symptom) ? COLORS.primary : COLORS.border,
                        color: selectedSymptoms.includes(symptom) ? COLORS.primary : COLORS.gray,
                      }}
                    >
                      {selectedSymptoms.includes(symptom) ? '✓ ' : ''}{symptom}
                    </button>
                  ))}
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '500',
                    color: COLORS.text
                  }}>
                    Дополнительный симптом
                  </label>
                  <input
                    type="text"
                    value={customSymptom}
                    onChange={e => setCustomSymptom(e.target.value)}
                    placeholder="Введите симптом..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${COLORS.border}`,
                      fontSize: '1rem',
                      backgroundColor: COLORS.white,
                      color: COLORS.text
                    }}
                  />
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: `1px solid ${COLORS.lightGray}`
              }}>
                <button
                  type="submit"
                  style={buttonStyles.primary}
                >
                  {editingId ? (
                    <>
                      <Edit size={20} />
                      Сохранить изменения
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Добавить запись
                    </>
                  )}
                </button>
                
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    style={buttonStyles.secondary}
                  >
                    <X size={20} />
                    Отмена
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: COLORS.primary 
            }}>
              История записей
            </h2>
            <span style={{
              backgroundColor: COLORS.light,
              color: COLORS.primary,
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              {entries.length}
            </span>
          </div>

          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: COLORS.gray 
            }}>
              Загрузка записей...
            </div>
          ) : entries.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '4rem',
              backgroundColor: COLORS.white,
              borderRadius: '12px',
              border: `1px dashed ${COLORS.border}`
            }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: COLORS.light,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Calendar size={32} color={COLORS.primary} />
              </div>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                color: COLORS.text
              }}>
                Записей пока нет
              </h3>
              <p style={{ color: COLORS.gray, marginBottom: '1.5rem' }}>
                Добавьте первую запись о своем самочувствии
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setIsFormVisible(true);
                }}
                style={{
                  ...buttonStyles.primary,
                  padding: '0.75rem 2rem'
                }}
              >
                <Plus size={20} />
                Создать первую запись
              </button>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {entries.map(entry => {
                const wellBeingOption = WELL_BEING_OPTIONS.find(w => w.value === entry.well_being_score);
                
                return (
                  <div
                    key={entry.id}
                    style={{
                      backgroundColor: COLORS.white,
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: '0 2px 8px rgba(0, 86, 179, 0.08)',
                      border: `1px solid ${COLORS.light}`,
                      transition: 'all 0.3s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          marginBottom: '0.25rem'
                        }}>
                          <Calendar size={16} color={COLORS.gray} />
                          <span style={{ 
                            fontWeight: '600', 
                            color: COLORS.primary,
                            fontSize: '1.1rem'
                          }}>
                            {entry.date}
                          </span>
                        </div>
                        <div style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.25rem 0.75rem',
                          backgroundColor: COLORS.light,
                          borderRadius: '20px',
                          marginTop: '0.5rem'
                        }}>
                          <Heart size={14} color={wellBeingOption?.color || COLORS.primary} />
                          <span style={{ 
                            color: wellBeingOption?.color || COLORS.primary,
                            fontSize: '0.85rem',
                            fontWeight: '500'
                          }}>
                            {wellBeingOption?.label || 'Удовлетворительно'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {entry.description && (
                      <div style={{ 
                        marginBottom: '1rem',
                        flexGrow: 1
                      }}>
                        <p style={{ 
                          color: COLORS.text,
                          fontSize: '0.95rem',
                          lineHeight: '1.5'
                        }}>
                          {entry.description}
                        </p>
                      </div>
                    )}

                    {entry.symptoms.length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem'
                        }}>
                          <span style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: '600',
                            color: COLORS.text
                          }}>
                            Симптомы:
                          </span>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: '0.4rem'
                        }}>
                          {entry.symptoms.slice(0, 5).map((symptom, index) => (
                            <span
                              key={index}
                              style={{
                                backgroundColor: COLORS.background,
                                color: COLORS.primary,
                                padding: '0.25rem 0.6rem',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                border: `1px solid ${COLORS.light}`
                              }}
                            >
                              {symptom}
                            </span>
                          ))}
                          {entry.symptoms.length > 5 && (
                            <span style={{
                              backgroundColor: COLORS.light,
                              color: COLORS.primary,
                              padding: '0.25rem 0.6rem',
                              borderRadius: '12px',
                              fontSize: '0.8rem',
                              fontWeight: '500'
                            }}>
                              +{entry.symptoms.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div style={{ 
                      display: 'flex', 
                      gap: '0.75rem',
                      marginTop: 'auto',
                      paddingTop: '1rem',
                      borderTop: `1px solid ${COLORS.lightGray}`
                    }}>
                      <button
                        onClick={() => startEditing(entry)}
                        style={buttonStyles.secondary}
                      >
                        <Edit size={16} />
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        style={{
                          ...buttonStyles.secondary,
                          color: '#E53E3E',
                          borderColor: '#FED7D7'
                        }}
                      >
                        <Trash2 size={16} />
                        Удалить
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalPage;