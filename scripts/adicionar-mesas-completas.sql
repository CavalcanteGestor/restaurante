-- Script para adicionar todas as mesas do restaurante
-- Baseado nas regras fornecidas

-- SALÃO EXTERNO, COBERTO (Primeiro Andar)
INSERT INTO mesas (codigo, capacidade, tipo, andar, ambiente, disponivel, pode_juntar, eventos_pessoais, eventos_corporativos, so_eventos, privativa) VALUES
('1', 4, 'redonda', 'primeiro', 'Salão Externo Coberto', true, false, true, false, false, false),
('2', 4, 'redonda', 'primeiro', 'Salão Externo Coberto', true, false, true, false, false, false),
('3', 3, 'redonda', 'primeiro', 'Salão Externo Coberto', true, false, true, false, false, false),
('4', 4, 'redonda', 'primeiro', 'Salão Externo Coberto', true, false, true, false, false, false),
('5', 4, 'redonda', 'primeiro', 'Salão Externo Coberto', true, false, true, false, false, false),
('6', 4, 'redonda', 'primeiro', 'Salão Externo Coberto', true, false, true, false, false, false)
ON CONFLICT (codigo) DO NOTHING;

-- SALÃO INTERNO — CRISTAL (Primeiro Andar)
INSERT INTO mesas (codigo, capacidade, tipo, andar, ambiente, disponivel, pode_juntar, junta_com, eventos_pessoais, eventos_corporativos, so_eventos, tem_tv, privativa) VALUES
('7', 6, 'retangular', 'primeiro', 'Cristal', true, false, null, true, true, false, true, false),
('8', 4, 'retangular', 'primeiro', 'Cristal', true, true, '11,9,10', true, true, false, false, false),
('9', 4, 'retangular', 'primeiro', 'Cristal', true, true, '10,8,11', true, true, false, false, false),
('10', 5, 'retangular', 'primeiro', 'Cristal', true, true, '11,9,8', true, true, false, false, false),
('11', 5, 'retangular', 'primeiro', 'Cristal', true, true, '10,8,9', true, true, false, false, false)
ON CONFLICT (codigo) DO NOTHING;

-- SALÃO INTERNO — BANDEIRA (Primeiro Andar)
INSERT INTO mesas (codigo, capacidade, tipo, andar, ambiente, disponivel, pode_juntar, junta_com, eventos_pessoais, eventos_corporativos, so_eventos, tem_tv, privativa) VALUES
('12', 4, 'retangular', 'primeiro', 'Bandeira', true, true, '13,14', true, true, false, true, false),
('13', 2, 'retangular', 'primeiro', 'Bandeira', true, true, '12,14', true, true, false, true, false),
('14', 2, 'retangular', 'primeiro', 'Bandeira', true, true, '12,13', true, true, false, true, false)
ON CONFLICT (codigo) DO NOTHING;

-- SEGUNDO ANDAR, EXTERNO COBERTO
INSERT INTO mesas (codigo, capacidade, tipo, andar, ambiente, disponivel, pode_juntar, eventos_pessoais, eventos_corporativos, so_eventos, privativa) VALUES
('21', 7, 'retangular', 'segundo', 'Segundo Andar Externo Coberto', true, false, true, false, false, false),
('22', 3, 'retangular', 'segundo', 'Segundo Andar Externo Coberto', true, false, true, false, false, false),
('23', 2, 'retangular', 'segundo', 'Segundo Andar Externo Coberto', true, false, true, false, false, false),
('24', 2, 'retangular', 'segundo', 'Segundo Andar Externo Coberto', true, false, true, false, false, false)
ON CONFLICT (codigo) DO NOTHING;

-- SALA "CINEMA" (Segundo Andar)
INSERT INTO mesas (codigo, capacidade, tipo, andar, ambiente, disponivel, pode_juntar, junta_com, eventos_pessoais, eventos_corporativos, so_eventos, privativa) VALUES
('25', 4, 'retangular', 'segundo', 'Cinema', true, true, '26', true, false, false, false),
('26', 4, 'retangular', 'segundo', 'Cinema', true, true, '25', true, false, false, false)
ON CONFLICT (codigo) DO NOTHING;

-- SALA "OPERA" (Segundo Andar)
INSERT INTO mesas (codigo, capacidade, tipo, andar, ambiente, disponivel, pode_juntar, junta_com, eventos_pessoais, eventos_corporativos, so_eventos, privativa) VALUES
('27', 2, 'retangular', 'segundo', 'Opera', true, true, '28,29,34', true, true, false, false),
('28', 2, 'retangular', 'segundo', 'Opera', true, true, '27,29,34', true, true, false, false),
('29', 2, 'retangular', 'segundo', 'Opera', true, true, '27,28,34', true, true, false, false),
('30', 2, 'retangular', 'segundo', 'Opera', true, true, '33', true, true, false, false),
('31', 4, 'retangular', 'segundo', 'Opera', true, false, null, true, true, false, false),
('32', 4, 'retangular', 'segundo', 'Opera', true, false, null, true, true, false, false),
('33', 2, 'retangular', 'segundo', 'Opera', true, true, '30', true, true, false, false),
('34', 2, 'retangular', 'segundo', 'Opera', true, true, '27,28,29', true, true, false, false)
ON CONFLICT (codigo) DO NOTHING;

-- SALA PALIO DI SIENA (Segundo Andar)
INSERT INTO mesas (codigo, capacidade, tipo, andar, ambiente, disponivel, pode_juntar, junta_com, eventos_pessoais, eventos_corporativos, so_eventos, privativa) VALUES
('35', 2, 'retangular', 'segundo', 'Palio di Siena', true, true, '36,37,38', true, true, false, false),
('36', 2, 'retangular', 'segundo', 'Palio di Siena', true, true, '35,37,38', true, true, false, false),
('37', 2, 'retangular', 'segundo', 'Palio di Siena', true, true, '38,35,36', true, true, false, false),
('38', 2, 'retangular', 'segundo', 'Palio di Siena', true, true, '37,35,36', true, true, false, false)
ON CONFLICT (codigo) DO NOTHING;

-- TERRAÇO (Só eventos)
INSERT INTO mesas (codigo, capacidade, tipo, andar, ambiente, disponivel, pode_juntar, eventos_pessoais, eventos_corporativos, so_eventos, privativa) VALUES
('61', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('62', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('63', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('64', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('65', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('66', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('67', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('68', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('69', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('70', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('71', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('72', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('73', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('74', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('75', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('76', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('77', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('78', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('79', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('80', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('81', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false),
('82', 4, 'retangular', 'segundo', 'Terraço', true, false, false, false, true, false)
ON CONFLICT (codigo) DO NOTHING;

-- EMPORIO (Só eventos, capacidade variável)
INSERT INTO mesas (codigo, capacidade, tipo, andar, ambiente, disponivel, pode_juntar, eventos_pessoais, eventos_corporativos, so_eventos, tem_tv, privativa, observacao) VALUES
('41', 4, 'retangular', 'primeiro', 'Empório', true, true, false, true, true, true, false, 'Capacidade variável conforme evento. Aluguel de mídia à parte.'),
('42', 4, 'retangular', 'primeiro', 'Empório', true, true, false, true, true, true, false, 'Capacidade variável conforme evento. Aluguel de mídia à parte.'),
('43', 4, 'retangular', 'primeiro', 'Empório', true, true, false, true, true, true, false, 'Capacidade variável conforme evento. Aluguel de mídia à parte.'),
('44', 4, 'retangular', 'primeiro', 'Empório', true, true, false, true, true, true, false, 'Capacidade variável conforme evento. Aluguel de mídia à parte.'),
('45', 4, 'retangular', 'primeiro', 'Empório', true, true, false, true, true, true, false, 'Capacidade variável conforme evento. Aluguel de mídia à parte.'),
('46', 4, 'retangular', 'primeiro', 'Empório', true, true, false, true, true, true, false, 'Capacidade variável conforme evento. Aluguel de mídia à parte.'),
('47', 4, 'retangular', 'primeiro', 'Empório', true, true, false, true, true, true, false, 'Capacidade variável conforme evento. Aluguel de mídia à parte.'),
('48', 4, 'retangular', 'primeiro', 'Empório', true, true, false, true, true, true, false, 'Capacidade variável conforme evento. Aluguel de mídia à parte.'),
('49', 4, 'retangular', 'primeiro', 'Empório', true, true, false, true, true, true, false, 'Capacidade variável conforme evento. Aluguel de mídia à parte.'),
('50', 4, 'retangular', 'primeiro', 'Empório', true, true, false, true, true, true, false, 'Capacidade variável conforme evento. Aluguel de mídia à parte.'),
('51', 4, 'retangular', 'primeiro', 'Empório', true, true, false, true, true, true, false, 'Capacidade variável conforme evento. Aluguel de mídia à parte.'),
('52', 4, 'retangular', 'primeiro', 'Empório', true, true, false, true, true, true, false, 'Capacidade variável conforme evento. Aluguel de mídia à parte.')
ON CONFLICT (codigo) DO NOTHING;

