# frozen_string_literal: true

require 'test_helper'

class PasswordResetMailerTest < ActionMailer::TestCase
  def setup
    @user = User.create!(username: 'test', email: 'test@test.de', password: 'randompasswd')
  end

  test 'reset link' do
    email = PasswordResetMailer.with(user: @user, token: SecureRandom.base64(32)).reset_link

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal @user.email, email.to.first
    assert_equal 'Here is your password reset link', email.subject
  end
end
