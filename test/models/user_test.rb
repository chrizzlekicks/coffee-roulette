# frozen_string_literal: true

require 'test_helper'

class UserTest < ActiveSupport::TestCase
  test 'username validation' do
    user = User.new(email: 'test@test.com')

    assert_not user.valid?
    assert_raise ActiveRecord::RecordInvalid do
      user.save!
    end
  end

  test 'email validation' do
    user = User.new do |u|
      u.username = 'test'
      u.email = 'test'
      u.password = 'ValidPassword123!'
    end

    assert_not user.valid?

    e = assert_raise ActiveRecord::RecordInvalid do
      user.save!
    end

    assert_equal 'Validation failed: Email Please provide valid email address', e.message
  end

  test 'password validation: no password at all' do
    user = User.new do |u|
      u[:username] = 'test'
      u[:email] = 'test@test.de'
    end

    assert_not user.valid?

    e = assert_raise ActiveRecord::RecordInvalid do
      user.save!
    end

    assert_equal "Validation failed: Password can't be blank", e.message
  end

  test 'password validation: empty string' do
    user = User.new do |u|
      u.username = 'test'
      u.email = 'test@test.de'
      u.password = ''
    end

    assert_not user.valid?

    e = assert_raise ActiveRecord::RecordInvalid do
      user.save!
    end

    assert_equal "Validation failed: Password can't be blank", e.message
  end

  test 'password validation: too short' do
    user = User.new do |u|
      u.username = 'test'
      u.email = 'test@test.de'
      u.password = 'Short1!'
    end

    assert_not user.valid?

    e = assert_raise ActiveRecord::RecordInvalid do
      user.save!
    end

    assert_match(/must be at least 12 characters/, e.message)
  end

  test 'password validation: missing uppercase letter' do
    user = User.new do |u|
      u.username = 'test'
      u.email = 'test@test.de'
      u.password = 'lowercase123!'
    end

    assert_not user.valid?

    e = assert_raise ActiveRecord::RecordInvalid do
      user.save!
    end

    assert_match(/must be at least 12 characters and contain at least one uppercase letter/, e.message)
  end

  test 'password validation: missing number' do
    user = User.new do |u|
      u.username = 'test'
      u.email = 'test@test.de'
      u.password = 'NoNumbersHere!'
    end

    assert_not user.valid?

    e = assert_raise ActiveRecord::RecordInvalid do
      user.save!
    end

    assert_match(/must be at least 12 characters and contain at least one uppercase letter, one number/, e.message)
  end

  test 'password validation: missing special character' do
    user = User.new do |u|
      u.username = 'test'
      u.email = 'test@test.de'
      u.password = 'NoSpecialChar123'
    end

    assert_not user.valid?

    e = assert_raise ActiveRecord::RecordInvalid do
      user.save!
    end

    assert_match(/must be at least 12 characters and contain at least one uppercase letter, one number, and one special character/, e.message)
  end

  test 'password validation: valid password with all requirements' do
    user = User.new do |u|
      u.username = 'test'
      u.email = 'test@test.de'
      u.password = 'ValidPassword123!'
    end

    assert user.valid?
    assert user.save!
  end

  test 'save user with correct username and email and password' do
    user = User.new do |u|
      u.email = 'test@test.de'
      u.username = 'test'
      u.password = 'ValidPassword123!'
    end

    assert user.valid?
    assert user.save!
    assert_equal 1, User.all.count
  end
end
