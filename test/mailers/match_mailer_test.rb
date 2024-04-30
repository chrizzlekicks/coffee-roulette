# frozen_string_literal: true

require 'test_helper'

class MatchMailerTest < ActionMailer::TestCase
  def setup
    @user_one = User.create!(username: 'test', email: 'test@test.de', password: 'randompasswd')
    @user_two = User.create!(username: 'test-2', email: 'test-2@test.de', password: 'anotherrandompasswd')
  end

  test 'matched' do
    email = MatchMailer.with(user: @user_one, matched_users: [@user_two]).matched

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal @user_one.email, email.to.first
    assert_equal "You got matched!", email.subject
    assert_includes email.html_part.body.to_s, "Heyyyy #{@user_one.username}!"
    assert_includes email.html_part.body.to_s, "You got a new match with #{@user_two.email}!"
  end
end
