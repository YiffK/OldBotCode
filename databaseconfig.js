const modes = {
  'development': {
    'username': 'root',
    'password': 'password',
    'database': 'yiffycornerbot',
    'host': '127.0.0.1',
    'dialect': 'mysql',
    'logging': false,
    'port': 3306
  },
  'test': {
    'username': 'root',
    'password': 'password',
    'database': 'yiffycornerbot',
    'host': '127.0.0.1',
    'dialect': 'mysql',
    'logging': false,
    'port': 3306
  },
  'production': {
    'username': 'root',
    'password': 'password',
    'database': 'yiffycornerbot',
    'host': '127.0.0.1',
    'dialect': 'mysql',
    'logging': false,
    'port': 3306
  },
}

const currentMode = 'development'

module.exports =  modes[ currentMode ]
