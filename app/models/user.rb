# frozen_string_literal: true

class User < ApplicationRecord
  has_many :user_matches
  has_many :matches, through: :user_matches

  has_secure_password

  generates_token_for :password_reset, expires_in: 1.day do
    BCrypt::Password.new(password_digest).salt[-10..]
  end

  # password should be properly validated
  validates :email, presence: true, uniqueness: true, format: {
    with: /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/,
    message: 'Please provide valid email address'
  }
  validates :username, presence: true

  scope :active, -> { where active: true }
  scope :not_matched_today, lambda {
    joins(matches: :user_matches)
      .where.not(matches: { date: DateTime.current.beginning_of_day..DateTime.current.end_of_day })
  }
end
