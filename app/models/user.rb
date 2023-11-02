class User < ApplicationRecord
  validates :email, presence: true, uniqueness: true, format: {
    with: /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/,
    message: 'Please provide valid email address'
  }
  validates :name, presence: true
end
