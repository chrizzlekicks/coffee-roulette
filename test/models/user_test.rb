# frozen_string_literal: true

require "test_helper"

class UserTest < ActiveSupport::TestCase
  test 'username validation' do
    user = User.new(:email => "test@test.com")

    assert_not user.valid?
    assert_raise ActiveRecord::RecordInvalid do
      user.save!
    end
  end

  test 'email validation' do
    user = User.new do |u|
      u.username = "test"
      u.email = "test"
      u.password = "random"
    end

    assert_not user.valid?

    e = assert_raise ActiveRecord::RecordInvalid do
      user.save!
    end

    assert_equal 'Validation failed: Email Please provide valid email address', e.message
  end

  test 'password validation: no password at all' do
    user = User.new do |u|
      u[:username] = "test"
      u[:email] = "test@test.de"
    end

    assert_not user.valid?

    e = assert_raise ActiveRecord::RecordInvalid do
      user.save!
    end

    assert_equal "Validation failed: Password can't be blank", e.message
  end

  test 'password validation: empty string' do
    user = User.new do |u|
      u.username = "test"
      u.email = "test@test.de"
      u.password = ""
    end

    assert_not user.valid?

    e = assert_raise ActiveRecord::RecordInvalid do
      user.save!
    end

    assert_equal "Validation failed: Password can't be blank", e.message
  end


  test "save user with correct username and email and password" do
    user = User.new do |u|
      u.email = "test@test.de"
      u.username = "test"
      u.password = "random"
    end

    assert user.valid?
    assert user.save!
    assert_equal 1, User.all.count
  end
end
