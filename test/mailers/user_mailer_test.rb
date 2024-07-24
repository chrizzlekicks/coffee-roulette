# frozen_string_literal: true

require 'test_helper'

class UserMailerTest < ActionMailer::TestCase
  setup do
    @user = User.create!(username: 'test', email: 'test@test.de', password: 'randompasswd')
  end

  test 'welcome' do
    email = UserMailer.with(user: @user).welcome

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal @user.email, email.to.first
    assert_equal 'Welcome', email.subject
    assert email.html_part.body.to_s.include?("your username is: #{@user.username}")
    assert email.text_part.body.to_s.include?("your username is: #{@user.username}")
  end
end
