require 'securerandom'

class User < ApplicationRecord
  has_many :user_matches
  has_many :matches, through: :user_matches

  has_secure_password

  validates :email, presence: true, uniqueness: true, format: {
    with: /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/,
    message: 'Please provide valid email address'
  }
  validates :username, presence: true
end
